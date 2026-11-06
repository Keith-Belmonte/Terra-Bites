export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "critical";
  action: string;
  details: string;
}

/**
 * Pure architectural module that formats operational farm activities 
 * into immutable audit logging trails.
 */
export function createAuditLog(
  fieldName: string, 
  actionType: "metric_change" | "alert_triggered" | "system_sync", 
  message: string,
  isCritical: boolean = false
): AuditLogEntry {
  const timestamp = new Date().toISOString();
  const id = `log_${actionType}_${Math.random().toString(36).substring(2, 7)}`;
  
  let level: "info" | "warning" | "critical" = "info";
  if (isCritical) {
    level = "critical";
  } else if (actionType === "alert_triggered") {
    level = "warning";
  }

  return {
    id,
    timestamp,
    level,
    action: actionType.toUpperCase(),
    details: `[${fieldName}] ${message}`
  };
}
