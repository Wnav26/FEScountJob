import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import NotPermitted from "./not-permitted";
import Loading from "../loading";

interface RoleBaseRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
}

const RoleBaseRoute = (props: RoleBaseRouteProps) => {
    const user = useAppSelector(state => state.account.user);
    const userRole: string = user?.role?.name ?? "";

    // Nếu có requiredRoles, kiểm tra xem user có role phù hợp không
    if (props.requiredRoles && props.requiredRoles.length > 0) {
        if (userRole && props.requiredRoles.includes(userRole)) {
            return (<>{props.children}</>)
        } else {
            return (<NotPermitted />)
        }
    } 
    // Nếu không có requiredRoles, sử dụng logic cũ
    else if (userRole !== 'NORMAL_USER') {
        return (<>{props.children}</>)
    } else {
        return (<NotPermitted />)
    }
}

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
}

const ProtectedRoute = (props: ProtectedRouteProps) => {
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated)
    const isLoading = useAppSelector(state => state.account.isLoading)

    return (
        <>
            {isLoading === true ?
                <Loading />
                :
                <>
                    {isAuthenticated === true ?
                        <>
                            <RoleBaseRoute requiredRoles={props.requiredRoles}>
                                {props.children}
                            </RoleBaseRoute>
                        </>
                        :
                        <Navigate to='/login' replace />
                    }
                </>
            }
        </>
    )
}

export default ProtectedRoute;