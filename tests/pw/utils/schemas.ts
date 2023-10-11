import { z } from 'zod';

export const schemas = {
    // reportSummarySchema
    reportSummarySchema: z.object({
        products: z.object({
            this_month: z.number(),
            last_month: z.number(),
            this_period: z.null(),
            class: z.string(),
            parcent: z.number(),
        }),
        withdraw: z.object({
            pending: z.string(),
            completed: z.string(),
            cancelled: z.string(),
        }),
        vendors: z.object({
            inactive: z.number(),
            active: z.number(),
            this_month: z.number(),
            last_month: z.number(),
            this_period: z.null(),
            class: z.string(),
            parcent: z.number(),
        }),
        sales: z.object({
            this_month: z.number(),
            last_month: z.number(),
            this_period: z.null(),
            class: z.string(),
            parcent: z.number(),
        }),
        orders: z.object({
            this_month: z.number(),
            last_month: z.number(),
            this_period: z.null(),
            class: z.string(),
            parcent: z.number(),
        }),
        earning: z.object({
            this_month: z.number(),
            last_month: z.number(),
            this_period: z.null(),
            class: z.string(),
            parcent: z.number(),
        }),
    }),
};
