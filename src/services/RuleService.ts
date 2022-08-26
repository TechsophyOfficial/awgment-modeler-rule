import { request, ResponseProps } from '../request';
import { RuleProps, RuleDeployProps, SaveRuleResponse } from '../components/ruleModeler';
import { RULE_DEPLOY, RULE_ENDPOINT } from '../constants/endpoints';

export interface RuleInstance {
    content: string;
    createdOn: Date;
    id: string;
    name: string;
    updatedById: string;
    updatedOn: Date;
    version: number;
}

interface RuleTableProps {
    totalElements: number;
    page: number;
    size: number;
    content: RuleInstance[] | [];
}
interface RuleReqProps {
    paginate: boolean;
    apiUrl: string;
    rowsPerPage?: number;
    page?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    searchTerm?: string;
}

// export const GET_RULE_ENDPOINT = `${process.env.REACT_APP_API_GATEWAY_URL}${RULE_ENDPOINT}`;
// export const DEPLOY_RULE_ENDPOINT = `${process.env.REACT_APP_API_GATEWAY_URL}${RULE_DEPLOY}`;

export const getAllRules = async ({
    paginate = true,
    apiUrl,
    rowsPerPage = 10,
    page = 1,
    sortBy = '',
    sortDirection = 'desc',
    searchTerm = '',
}: RuleReqProps): Promise<{ success: boolean; message?: string; data?: RuleTableProps | any }> => {
    const sort = sortBy && sortDirection ? `&sort-by=${sortBy}:${sortDirection}` : '';
    const search = searchTerm ? `&q=${searchTerm}` : '';
    let URL = `${apiUrl}${RULE_ENDPOINT}?include-content=true`;

    if (!paginate) {
        URL += `${sort}${search}`;
        const r: ResponseProps = (await request.get(URL)) as ResponseProps;
        if (r.success) {
            return { success: true, message: r.message, data: r.data as any };
        }
    } else {
        URL += `&size=${rowsPerPage}&page=${page}${sort}${search}`;
        const r: ResponseProps = (await request.get(URL)) as ResponseProps;
        if (r.success) {
            const data: RuleTableProps = r.data as RuleTableProps;
            return { success: true, message: r.message, data: data };
        }
    }

    return { success: false, message: 'Unable to fetch rules' };
};

//To Get All Rules API call

export const getRuleDetails = async (
    id: string,
    apiUrl: string,
): Promise<{ success: boolean; data?: RuleProps; message?: string }> => {
    const r: ResponseProps = (await request.get(`${apiUrl}${RULE_ENDPOINT}/${id}`)) as ResponseProps;
    if (r && r.success) {
        const rule = r.data as RuleProps;
        return { success: r.success, data: rule, message: r.message };
    }
    return { success: false };
};

export const saveRule = async (
    ruleDetails,
    apiUrl,
): Promise<{ success: boolean; data?: SaveRuleResponse; message?: string }> => {
    const r: ResponseProps = (await request.postForm(`${apiUrl}${RULE_ENDPOINT}`, ruleDetails)) as ResponseProps;
    if (r.success) {
        const rule = r.data as SaveRuleResponse;
        return { success: r.success, data: rule, message: r.message };
    }
    return { success: false };
};

export const deployRule = async (
    ruleDetails: RuleDeployProps,
    apiUrl: any,
): Promise<{ success: boolean; message?: string }> => {
    const { id, name, deploymentName, content, version } = ruleDetails;
    const blob = new Blob([content]);
    const fileOfBlob = new File([blob], `${deploymentName}.dmn`);
    const params = {
        id: id,
        name: name,
        version: version,
        deploymentName: deploymentName,
        content: fileOfBlob,
    };

    const r: ResponseProps = (await request.postForm(`${apiUrl}${RULE_DEPLOY}`, params)) as ResponseProps;
    if (r.success) {
        return { success: r.success, message: r.message };
    }
    return { success: false };
};

export const deleteRule = async (id: string, apiUrl: string): Promise<{ success: boolean; message?: string }> => {
    const r: ResponseProps = (await request.delete(`${apiUrl}${RULE_ENDPOINT}/${id}`)) as ResponseProps;
    if (r.success) {
        return { success: r.success, message: r.message };
    }
    return { success: false };
};
