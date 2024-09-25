import { Group } from './group.model';

export interface User {
    _id?: string;
    id: string;        
    username: string;  
    email: string;  
    password: string;   
    roles: string[];  
    groups: Group[];   
    interestGroups: Group[];  
}

