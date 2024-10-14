import { dokanConfig } from "./dokan-config";

export const mapToDashboardRoute = (url: string): string => {
    const mappers = [
        {
            search: 'wp-admin/admin.php',
            replace: dokanConfig.dashboardReportUrl,
        },
        {
            search: 'admin.php',
            replace: '',
        }
    ]
    
    for(let i = 0; i < mappers.length; i++) {
        const item = mappers[i];
        
        if (url.includes(item.search)) {
            return url.replace(item.search, item.replace)
                .replace("page=wc-admin", "page=dokan-reports");
        }
    }
    
    return url;
}