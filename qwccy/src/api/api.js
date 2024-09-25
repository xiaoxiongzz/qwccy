import axiosInstance from "./index";
export function updateUserInfo(user_id, data) {
    return axiosInstance.put(`/users/${user_id}`, data);
}
export function getUserInfo(id) {
    return axiosInstance.get(`/check_users?user_id=${id}`);
}
export function addUserInfo(data) {
    return axiosInstance.post('/add_users', data);
}
export function addInvitee(data) {
    return axiosInstance.post('/add_invitee', data);
}
export function allUserInfoList() {
    return axiosInstance.get('/users');
}
