export interface DatabaseClickLog {
  id: string;
  user_id: string;
  timestamp: string;
  ip_address: string | null;
  location: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  url: string | null;
  element_id: string | null;
  element_class: string | null;
  action: string | null;
  component_name: string | null;
  page_title: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface FrontendClickLog {
  id: string;
  userId: string;
  timestamp: string;
  ipAddress: string | null;
  location: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  url: string | null;
  elementId: string | null;
  elementClass: string | null;
  action: string | null;
  componentName: string | null;
  pageTitle: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export function mapDatabaseClickLogToFrontend(dbClickLog: DatabaseClickLog): FrontendClickLog {
  return {
    id: dbClickLog.id,
    userId: dbClickLog.user_id,
    timestamp: dbClickLog.timestamp,
    ipAddress: dbClickLog.ip_address,
    location: dbClickLog.location,
    url: dbClickLog.url,
    elementId: dbClickLog.element_id,
    elementClass: dbClickLog.element_class,
    action: dbClickLog.action,
    componentName: dbClickLog.component_name,
    pageTitle: dbClickLog.page_title,
    userAgent: dbClickLog.user_agent,
    createdAt: dbClickLog.created_at,
    updatedAt: dbClickLog.updated_at
  };
}

export function mapFrontendClickLogToDatabase(frontendClickLog: FrontendClickLog): Omit<DatabaseClickLog, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: frontendClickLog.userId,
    timestamp: frontendClickLog.timestamp,
    ip_address: frontendClickLog.ipAddress,
    location: frontendClickLog.location,
    url: frontendClickLog.url,
    element_id: frontendClickLog.elementId,
    element_class: frontendClickLog.elementClass,
    action: frontendClickLog.action,
    component_name: frontendClickLog.componentName,
    page_title: frontendClickLog.pageTitle,
    user_agent: frontendClickLog.userAgent
  };
}
