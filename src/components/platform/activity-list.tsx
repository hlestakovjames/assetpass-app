"use client";

export type Activity = { icon: string; title: string; detail: string; time: string; type: string };

export function ActivityList({ activities }: { activities: Activity[] }) {
  return <div className="activity-list">{activities.map((activity) => <div className="activity-row" key={activity.title}><span className={`activity-icon activity-${activity.type}`}>{activity.icon}</span><div className="activity-copy"><strong>{activity.title}</strong><span>{activity.detail}</span></div><time>{activity.time}</time></div>)}</div>;
}
