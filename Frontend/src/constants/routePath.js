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
  STAFF_LIST: '/staffs',
  ADD_STAFF: '/staffs/add',
  UPDATE_STAFF: '/staffs/update/:id',
  STAFF_DETAIL: '/staffs/:id',

  // OAuth callback
  GOOGLE_AUTH_CALLBACK: '/auth/google/callback',

  // 404
  NOT_FOUND: '*',
};