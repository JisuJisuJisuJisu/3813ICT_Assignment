import { Group } from './group.model';

export interface User {
    id: string;        
    username: string;  
    email: string;  
    password: string;   
    roles: string[];  
    groups: Group[];   
    interestGroups: Group[];  
}

