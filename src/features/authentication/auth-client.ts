const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

export type IdentityOrganization = {
  id: string;
  displayName: string;
  category: string;
  status: string;
  membership: {
    id: string;
    status: string;
    createdAt: string;
    joinedAt: string | null;
  };
  roles: Array<{ key: string; name: string }>;
  permissions: string[];
};

export type AvailableWorkspace = {
  type: "platform" | "individual" | "organization";
  id?: string;
  label: string;
  href: string;
};

export type AuthenticatedUser = {
  id: string;
  fullName: string;
  email: string;
  status: string;
  profile: {
    firstName: string;
    middleName: string | null;
    lastName: string;
    phoneNumber: string;
    alternativePhone: string | null;
    countryCode: string;
    county: string | null;
    city: string | null;
    occupation: string | null;
    preferredContactMethod: string;
    profilePhotoUrl: string | null;
  } | null;
  platformRoles: string[];
  platformPermissions: string[];
  organizations: IdentityOrganization[];
  availableWorkspaces: AvailableWorkspace[];
  defaultWorkspace: AvailableWorkspace | null;
  selectedWorkspace?: AvailableWorkspace | null;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AuthenticatedUser;
};

type RefreshResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

type AuthListener = (user: AuthenticatedUser | null) => void;

let accessToken: string | null = null;
let csrfToken: string | null = null;
let currentUser: AuthenticatedUser | null = null;

let refreshInFlight: Promise<string | null> | null = null;
let restoreInFlight: Promise<AuthenticatedUser | null> | null = null;

const listeners = new Set<AuthListener>();

function notifyAuthListeners() {
  for (const listener of listeners) {
    listener(currentUser);
  }
}

function setAuthenticatedState(
  token: string,
  user: AuthenticatedUser,
) {
  accessToken = token;
  currentUser = user;
  notifyAuthListeners();
}

function clearLocalSession() {
  accessToken = null;
  csrfToken = null;
  currentUser = null;
  notifyAuthListeners();
}

async function readPayload<T>(response: Response): Promise<T | null> {
  return response.json().catch(() => null) as Promise<T | null>;
}

function getErrorMessage(
  payload: unknown,
  fallback: string,
): string {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload
  ) {
    const message = (payload as { message?: unknown }).message;

    if (typeof message === "string") {
      return message;
    }

    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === "string")
    ) {
      return message.join(", ");
    }
  }

  return fallback;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getCurrentUser(): AuthenticatedUser | null {
  return currentUser;
}

export function subscribeToAuth(
  listener: AuthListener,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

async function bootstrapCsrfToken(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/csrf`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await readPayload<{ csrfToken?: string }>(response);

  if (!response.ok || typeof payload?.csrfToken !== "string") {
    throw new Error(
      getErrorMessage(
        payload,
        "Unable to establish a secure authentication session.",
      ),
    );
  }

  csrfToken = payload.csrfToken;
  return csrfToken;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = await readPayload<LoginResponse & { message?: unknown }>(
    response,
  );

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload,
        "Unable to sign in. Check your credentials and try again.",
      ),
    );
  }

  if (
    !payload ||
    typeof payload.accessToken !== "string" ||
    !payload.user ||
    typeof payload.user.id !== "string"
  ) {
    throw new Error(
      "The authentication server returned an invalid response.",
    );
  }

  accessToken = payload.accessToken;

  try {
    await bootstrapCsrfToken();
  } catch (error) {
    clearLocalSession();
    throw error;
  }

  setAuthenticatedState(payload.accessToken, payload.user);

  return payload;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  const refreshOperation = (async () => {
    const token = csrfToken ?? (await bootstrapCsrfToken());

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "X-CSRF-Token": token,
      },
    });

    const payload = await readPayload<RefreshResponse>(response);

    if (
      !response.ok ||
      !payload ||
      typeof payload.accessToken !== "string"
    ) {
      clearLocalSession();
      return null;
    }

    accessToken = payload.accessToken;
    return payload.accessToken;
  })();

  refreshInFlight = refreshOperation;

  try {
    return await refreshOperation;
  } finally {
    if (refreshInFlight === refreshOperation) {
      refreshInFlight = null;
    }
  }
}

export async function restoreSession(): Promise<AuthenticatedUser | null> {
  if (restoreInFlight) {
    return restoreInFlight;
  }

  const restoreOperation = (async () => {
    await bootstrapCsrfToken();

    const token = await refreshAccessToken();

    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const user = await readPayload<AuthenticatedUser>(response);

    if (
      !response.ok ||
      !user ||
      typeof user.id !== "string"
    ) {
      clearLocalSession();
      return null;
    }

    setAuthenticatedState(token, user);
    return user;
  })();

  restoreInFlight = restoreOperation;

  try {
    return await restoreOperation;
  } finally {
    if (restoreInFlight === restoreOperation) {
      restoreInFlight = null;
    }
  }
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const makeRequest = (token: string | null) => {
    const headers = new Headers(init.headers);

    headers.set("Accept", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(url, {
      ...init,
      headers,
      credentials: "include",
    });
  };

  let response = await makeRequest(accessToken);

  if (response.status !== 401 || !accessToken) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();

  if (!refreshedToken) {
    return response;
  }

  response = await makeRequest(refreshedToken);
  return response;
}

export async function logout(): Promise<void> {
  try {
    const token = csrfToken ?? (await bootstrapCsrfToken());

    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-CSRF-Token": token,
      },
    });
  } finally {
    clearLocalSession();
  }
}

export async function logoutAll(): Promise<void> {
  try {
    if (!accessToken) {
      return;
    }

    await fetch(`${API_BASE_URL}/auth/logout-all`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } finally {
    clearLocalSession();
  }
}


export type RegistrationInput = {
  accountType: "individual" | "organization";
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  alternativePhone?: string;
  countryCode?: string;
  county?: string;
  city?: string;
  physicalAddress?: string;
  postalAddress?: string;
  occupation?: string;
  preferredContactMethod?: "email" | "phone";
  organizationDisplayName?: string;
  legalName?: string;
  organizationType?: string;
  industrySector?: string;
  legalStructure?: string;
  registrationNumber?: string;
  registrationAuthority?: string;
  registrationDate?: string;
  contactEmail?: string;
  contactPhone?: string;
  alternativeEmail?: string;
  website?: string;
  description?: string;
  postalCode?: string;
  taxIdentifier?: string;
  position?: string;
  registrationRelationship?: string;
  authorityConfirmation?: string;
  termsAccepted: boolean;
  privacyNoticeAcknowledged: boolean;
};

export async function registerAccount(input: RegistrationInput): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await readPayload<{ message?: string }>(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "Unable to create your account. Please try again."));
  }
  return { message: payload?.message ?? "Registration successful. Your account is active and you can sign in now." };
}

export async function verifyEmailAddress(token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ token }),
  });
  const payload = await readPayload<{ message?: string }>(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "This verification link is invalid or has expired."));
  }
  return { message: payload?.message ?? "Your email address has been verified. You can now sign in." };
}

export async function resendEmailVerification(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email }),
  });
  const payload = await readPayload<{ message?: string }>(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "Unable to request another verification email."));
  }
  return { message: payload?.message ?? "If the address can be registered, a verification email will be sent shortly." };
}


export async function refreshAuthenticatedIdentity(): Promise<AuthenticatedUser> {
  const response = await apiFetch('/auth/me', {
    method: 'GET',
    cache: 'no-store',
  });
  const user = await readPayload<AuthenticatedUser>(response);

  if (!response.ok || !user || typeof user.id !== 'string' || !accessToken) {
    throw new Error(
      getErrorMessage(user, 'Unable to refresh your AssetPass account context.'),
    );
  }

  setAuthenticatedState(accessToken, user);
  return user;
}

export async function activateIndividualWorkspace(): Promise<AuthenticatedUser> {
  const response = await apiFetch('/workspaces/individual/activate', {
    method: 'POST',
  });
  const payload = await readPayload<{ message?: unknown }>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Unable to activate your Individual Workspace.'));
  }

  return refreshAuthenticatedIdentity();
}

export async function deactivateIndividualWorkspace(): Promise<AuthenticatedUser> {
  const response = await apiFetch('/workspaces/individual/deactivate', {
    method: 'POST',
  });
  const payload = await readPayload<{ message?: unknown }>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Unable to deactivate your Individual Workspace.'));
  }

  return refreshAuthenticatedIdentity();
}

export async function selectWorkspaceContext(workspace: AvailableWorkspace): Promise<AuthenticatedUser> {
  const response = await apiFetch('/workspaces/context/select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contextType: workspace.type,
      contextId: workspace.id ?? null,
    }),
  });
  const payload = await readPayload<{ message?: unknown }>(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Unable to switch workspace context.'));
  }
  return refreshAuthenticatedIdentity();
}

export type OrganizationOnboardingInput = {
  representativeFirstName: string;
  representativeLastName: string;
  representativeEmail: string;
  representativePosition: string;
  registrationRelationship: string;
  authorityConfirmation: "yes";
  privacyNoticeAcknowledged: true;
  organizationDisplayName: string;
  organizationType: string;
  legalName?: string;
  industrySector?: string;
  legalStructure?: string;
  registrationNumber?: string;
  registrationAuthority?: string;
  registrationDate?: string;
  contactEmail: string;
  contactPhone: string;
  alternativeEmail?: string;
  website?: string;
  description?: string;
  countryCode?: string;
  county?: string;
  city?: string;
  physicalAddress: string;
  postalAddress?: string;
  postalCode?: string;
  taxIdentifier?: string;
};

export async function submitOrganizationOnboardingApplication(
  input: OrganizationOnboardingInput,
): Promise<{ applicationId: string; status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/organizations/onboarding/applications`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await readPayload<{ applicationId?: string; status?: string; message?: unknown }>(response);
  if (!response.ok) throw new Error(getErrorMessage(payload, "Unable to submit the organisation application."));
  if (!payload || typeof payload.applicationId !== "string") throw new Error("The onboarding service returned an invalid response.");
  return {
    applicationId: payload.applicationId,
    status: payload.status ?? "pending_email_verification",
    message: typeof payload.message === "string" ? payload.message : "Check the representative email address for a verification link.",
  };
}

export async function verifyOrganizationOnboardingEmail(token: string): Promise<{ message: string; organizationId?: string; onboardingSessionToken: string; onboardingSessionExpiresAt: string }> {
  const response = await fetch(`${API_BASE_URL}/organizations/onboarding/verify-email`, {
    method: "POST",
    credentials: "omit",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ token }),
  });
  const payload = await readPayload<{ message?: unknown; organizationId?: string; onboardingSessionToken?: string; onboardingSessionExpiresAt?: string }>(response);
  if (!response.ok) throw new Error(getErrorMessage(payload, "This organisation verification link is invalid or has expired."));
  if (typeof payload?.onboardingSessionToken !== "string" || typeof payload.onboardingSessionExpiresAt !== "string") {
    throw new Error("The onboarding session could not be established. Please contact support.");
  }
  return {
    message: typeof payload.message === "string" ? payload.message : "Representative email verified. Your organisation application is awaiting review.",
    organizationId: payload.organizationId,
    onboardingSessionToken: payload.onboardingSessionToken,
    onboardingSessionExpiresAt: payload.onboardingSessionExpiresAt,
  };
}

export type OrganizationOnboardingSessionData = {
  applicationId: string;
  status: string;
  representative: { firstName: string; lastName: string; email: string };
  organization: { id: string; displayName: string; status: string } | null;
  submittedAt: string | null;
  updatedAt: string;
};

export async function getOrganizationOnboardingSession(token: string): Promise<OrganizationOnboardingSessionData> {
  const response = await fetch(`${API_BASE_URL}/organizations/onboarding/session`, {
    method: "GET",
    credentials: "omit",
    cache: "no-store",
    headers: { Accept: "application/json", "X-Organization-Onboarding-Session": token },
  });
  const payload = await readPayload<OrganizationOnboardingSessionData & { message?: unknown }>(response);
  if (!response.ok || !payload || typeof payload.applicationId !== "string") {
    throw new Error(getErrorMessage(payload, "Your organisation onboarding session has expired or is unavailable."));
  }
  return payload;
}

export async function closeOrganizationOnboardingSession(token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/organizations/onboarding/session/close`, {
    method: "POST",
    credentials: "omit",
    cache: "no-store",
    headers: { Accept: "application/json", "X-Organization-Onboarding-Session": token },
  });
  const payload = await readPayload<{ message?: unknown }>(response);
  if (!response.ok) throw new Error(getErrorMessage(payload, "Unable to close the onboarding session."));
}

export async function claimOrganizationWithToken(claimToken: string): Promise<AuthenticatedUser> {
  const response = await apiFetch('/organizations/onboarding/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claimToken }),
  });
  const payload = await readPayload<{ message?: unknown }>(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Unable to claim the organisation. Check the claim code and signed-in representative email.'));
  }
  return refreshAuthenticatedIdentity();
}
