import type { NavigateFunction } from 'react-router-dom';

export interface ToolsProps {
    navigate?: NavigateFunction;
    [ key: string ]: unknown;
}

export type ToolType = {
    id: string;
    name: string;
    desc: string;
    button: string;
    total_orders?: number;
    offset?: number;
    limit?: number;
    page?: number;
};
