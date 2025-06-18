export const ROUTE_PATH = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY: '/verify',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_FORGOT_PASSWORD: '/verify-forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Public
  HOME: '/',
  ABOUT_US: '/aboutus',
  NEWS: '/news',
  SERVICES: '/services',
  SPECIALTIES: '/specialties',
  PRIVACY_POLICY: '/privacypolicy',
  TERMS_OF_SERVICE: '/termsofservice',

  // Staff
  STAFF_LIST: 'admin/staffs',
  ADD_STAFF: 'admin/staffs/add',
  UPDATE_STAFF: 'admin/staffs/update/:id',
  STAFF_DETAIL: 'admin/staffs/:id',

  // OAuth callback
  GOOGLE_AUTH_CALLBACK: '/google-auth-success',

  // User-profile
  USER_PROFILE: '/user-profile',
  USER_PROFILE_UPDATE: '/user-profile/update',

  //Service manager
  SERVICES_LIST: '/createMedical',  

  // 404
  NOT_FOUND: '*',
};