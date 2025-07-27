classDiagram
    class HomePage {
        +specialties: Array
        +healthPackages: Array
        +doctors: Array
        +news: Array
        +useEffect(): void
        +fetchSpecialties(): void
        +fetchHealthPackages(): void
        +fetchDoctors(): void
        +fetchNews(): void
    }
    
    class LoginPage {
        +email: string
        +password: string
        +errorMsg: string
        +showPassword: boolean
        +handleSubmit(): void
        +handleGoogleLogin(): void
    }
    
    class RegisterPage {
        +email: string
        +password: string
        +confirmPassword: string
        +errorMsg: string
        +showPassword: boolean
        +handleSubmit(): void
    }
    
    class AppointmentBookingPage {
        +appointmentData: Object
        +specialties: Array
        +doctors: Array
        +healthPackages: Array
        +handleSubmit(): void
        +handleSpecialtyChange(): void
        +handleDoctorChange(): void
    }
    
    class DoctorDetailPage {
        +doctor: Object
        +loading: boolean
        +error: string
        +fetchDoctor(): void
    }
    
    class PatientDetailPage {
        +patient: Object
        +appointments: Array
        +processes: Object
        +stepHistories: Object
        +fetchPatient(): void
        +fetchAppointments(): void
    }
    
    class CreateHealthPackagePage {
        +formData: Object
        +availableServices: Array
        +selectedServices: Array
        +openSpecialties: Array
        +handleSubmit(): void
        +handleServiceChange(): void
    }
    
    class CreateMedicalProcessPage {
        +doctor: Object
        +appointmentsToday: Array
        +services: Array
        +processStepsForm: Array
        +handleSubmit(): void
        +addProcessStep(): void
    }
    
    class StatisticalPage {
        +appointments: Array
        +patients: Array
        +payments: Array
        +year: number
        +fetchData(): void
        +calculateStats(): void
    }
    
    class Header {
        +userData: Object
        +isActive(): boolean
        +handleLogout(): void
    }
    
    class Footer {
        +render(): JSX
    }
    
    class BannerName {
        +Text: string
        +render(): JSX
    }
    
    class SpecialtyCard {
        +id: string
        +name: string
        +description: string
        +logo: string
        +onClick(): void
    }
    
    class NewsCard {
        +news: Object
        +isAdmin: boolean
        +handleEdit(): void
        +handleDelete(): void
        +handleView(): void
    }
    
    class NotificationDropdown {
        +notifications: Array
        +fetchNotifications(): void
        +markAsRead(): void
    }
    
    class ProtectedRoute {
        +children: ReactNode
        +allowedRoles: Array
        +checkAuth(): boolean
    }
    
    class ConfirmationModal {
        +message: string
        +onConfirm: Function
        +onCancel: Function
        +title: string
    }
    
    class UserService {
        +login(email, password): Promise
        +register(email, password): Promise
        +getUserProfileByUserID(user): Promise
        +updateUserProfile(userId, profileData): Promise
        +ChangeAccountPasswords(userId, oldPassword, newPassword): Promise
        +getAllDoctors(): Promise
    }
    
    class AppointmentService {
        +createAppointment(appointmentData): Promise
        +getAppointments(): Promise
        +getAppointmentById(id): Promise
        +cancelAppointment(id): Promise
        +confirmAppointment(id): Promise
        +updateAppointmentStatus(id, status): Promise
        +getAppointmentsByPatient(patientId): Promise
        +getAppointmentsToday(): Promise
    }
    
    class DoctorService {
        +getDoctorProfileById(doctorId): Promise
        +createDoctorProfile(profileData): Promise
        +getDoctorsBySpecialty(specialtyId): Promise
        +getAllDoctors(): Promise
    }
    
    class PatientService {
        +getAllPatients(): Promise
        +getPatientById(id): Promise
    }
    
    class HealthPackageService {
        +getAllHealthPackages(): Promise
        +getHealthPackageById(id): Promise
        +createHealthPackage(packageData): Promise
        +updateHealthPackage(id, updateData): Promise
        +togglePackageStatus(id): Promise
    }
    
    class MedicalProcessService {
        +getMedicalProcessByAppointmentId(appointmentId): Promise
        +createMedicalProcess(medicalProcess): Promise
        +getAllMedicalProcesses(): Promise
        +updateMedicalProcessStatus(processId, status): Promise
        +getMyProcessByUserId(): Promise
    }
    
    class SpecialtyService {
        +createSpecialty(specialtyData): Promise
        +getAllSpecialties(): Promise
        +getOpenSpecialties(): Promise
    }
    
    class NewsService {
        +listNews(): Promise
        +createNews(newsData): Promise
        +updateNews(id, newsData): Promise
        +deleteNews(id): Promise
    }
    
    class PaymentService {
        +createPayment(paymentData): Promise
        +getPaymentByAppointmentId(appointmentId): Promise
        +updatePayment(paymentId, updateData): Promise
        +getAllPayments(): Promise
    }
    
    class PayOSService {
        +createPayment(paymentData): Promise
        +verifyPayment(orderCode): Promise
    }
    
    class NotificationService {
        +getNotificationsByUser(userId): Promise
        +createNotification(notificationData): Promise
    }
    
    class ChatService {
        +askMedicalAI(prompt): Promise
    }
    
    class User {
        +cidNumber: String
        +password: String
        +fullName: String
        +dob: Date
        +role: String
        +avatar: String
        +address: String
        +phone: String
        +email: String
        +status: String
        +gender: Boolean
        +otp: String
        +otpExpires: Date
        +timestamps: true
    }
    
    class Appointment {
        +patientId: ObjectId
        +doctorId: ObjectId
        +time: Date
        +status: String
        +specialties: Array
        +healthPackage: ObjectId
        +symptoms: String
        +timestamps: true
    }
    
    class DoctorProfile {
        +doctorId: ObjectId
        +certificateId: Array
        +description: String
        +yearsOfExperience: Number
        +specialties: Array
        +timestamps: true
    }
    
    class Specialty {
        +specialtyName: String
        +descspecialty: String
        +medicalFee: Number
        +documentId: Array
        +room: Array
        +chiefPhysician: ObjectId
        +status: Boolean
        +logo: String
        +timestamps: true
    }
    
    class HealthPackage {
        +packageName: String
        +packagePrice: Number
        +service: Array
        +specialties: Array
        +packageImage: String
        +status: String
        +description: String
        +userId: ObjectId
        +timestamps: true
    }
    
    class MedicalProcess {
        +appointmentId: ObjectId
        +doctorId: ObjectId
        +status: String
        +processSteps: Array
        +currentStep: Number
        +finalResult: String
        +timestamps: true
    }
    
    class ProcessStep {
        +serviceId: ObjectId
        +isCompleted: Boolean
        +notes: String
        +timestamps: true
    }
    
    class MedicalHistory {
        +patientId: ObjectId
        +processStep: ObjectId
        +resultFiles: Array
        +timestamps: true
    }
    
    class News {
        +title: String
        +blocks: Array
        +tags: Array
        +category: String
        +createdBy: ObjectId
        +createdAt: Date
    }
    
    class Payment {
        +appointmentId: ObjectId
        +status: String
        +examinationFee: Number
        +serviceFee: Array
        +methodExam: String
        +methodService: String
        +timestamps: true
    }
    
    class Notification {
        +userId: ObjectId
        +title: String
        +message: String
        +timestamps: true
    }
    
    class Room {
        +roomNumber: String
        +roomName: String
        +patientQueue: Array
        +status: String
        +timestamps: true
    }
    
    class ParaclinicalService {
        +paraclinalName: String
        +paraPrice: Number
        +specialty: ObjectId
        +room: ObjectId
        +status: String
        +timestamps: true
    }
    
    class DocumentUpload {
        +file_path: String
        +timestamps: true
    }
    
    class Schedule {
        +userId: ObjectId
        +room: ObjectId
        +shift: String
        +date: Date
        +timestamps: true
    }
    
    class Conversation {
        +paticipants: Array
        +timestamps: true
    }
    
    class Message {
        +conversationId: ObjectId
        +senderId: ObjectId
        +message: String
        +timestamps: true
    }
    
    class Review {
        +patientId: ObjectId
        +star: Number
        +comment: String
        +timestamps: true
    }
    
    class Remind {
        +appointmentId: ObjectId
        +time: Date
        +message: String
        +timestamps: true
    }
    
    class UserController {
        +getAllUsers(req, res): void
        +getUserById(req, res): void
        +updateUser(req, res): void
        +deleteUser(req, res): void
        +login(req, res): void
        +register(req, res): void
        +updateProfile(req, res): void
        +updatePassword(req, res): void
    }
    
    class AppointmentController {
        +createAppointment(req, res): void
        +getAppointments(req, res): void
        +getAppointmentById(req, res): void
        +updateAppointmentStatus(req, res): void
        +cancelAppointment(req, res): void
        +confirmAppointment(req, res): void
        +getAppointmentsToday(req, res): void
        +getAppointmentsByPatient(req, res): void
    }
    
    class DoctorController {
        +getDoctorProfileByDoctorId(req, res): void
        +createDoctorProfile(req, res): void
        +updateDoctorProfile(req, res): void
        +getDoctorsBySpecialty(req, res): void
        +listAllDoctors(req, res): void
    }
    
    class PatientController {
        +getAllPatients(req, res): void
        +getPatientById(req, res): void
        +createPatient(req, res): void
        +updatePatient(req, res): void
    }
    
    class HealthPackageController {
        +getHealthPackagesByUser(req, res): void
        +createHealthPackage(req, res): void
        +updateHealthPackage(req, res): void
        +deleteHealthPackage(req, res): void
        +togglePackageStatus(req, res): void
    }
    
    class MedicalProcessController {
        +createMedicalProcess(req, res): void
        +getAllMedicalProcesses(req, res): void
        +getMedicalProcessById(req, res): void
        +updateMedicalProcessStatus(req, res): void
        +getMedicalProcessByAppointmentId(req, res): void
        +createProcessStep(req, res): void
        +updateProcessStepNotes(req, res): void
    }
    
    class SpecialtyController {
        +getAllSpecialties(req, res): void
        +createSpecialty(req, res): void
        +updateSpecialty(req, res): void
        +deleteSpecialty(req, res): void
        +getSpecialtyById(req, res): void
    }
    
    class NewsController {
        +getAllNews(req, res): void
        +createNews(req, res): void
        +updateNews(req, res): void
        +deleteNews(req, res): void
        +getNewsById(req, res): void
    }
    
    class PaymentController {
        +createPayment(req, res): void
        +getPaymentByAppointmentId(req, res): void
        +updatePayment(req, res): void
        +getAllPayments(req, res): void
    }
    
    class PayOSController {
        +createPayment(req, res): void
        +verifyPayment(req, res): void
    }
    
    class NotificationController {
        +createNotification(req, res): void
        +getUserNotifications(req, res): void
        +markAsRead(req, res): void
    }
    
    class StaffController {
        +createStaff(req, res): void
        +getAllStaff(req, res): void
        +updateStaff(req, res): void
        +deleteStaff(req, res): void
    }
    
    class RoomController {
        +getAllRooms(req, res): void
        +createRoom(req, res): void
        +updateRoom(req, res): void
        +deleteRoom(req, res): void
        +toggleRoomStatus(req, res): void
    }
    
    class ServiceController {
        +createService(req, res): void
        +listService(req, res): void
        +updateService(req, res): void
        +deleteService(req, res): void
    }
    
    class ScheduleController {
        +getAllSchedules(req, res): void
        +createSchedule(req, res): void
        +updateSchedule(req, res): void
        +deleteSchedule(req, res): void
        +getAllReceptionists(req, res): void
    }
    
    class MedicalHistoryController {
        +getAllMedicalHistories(req, res): void
        +createMedicalHistory(req, res): void
        +getMedicalHistoryByPatientId(req, res): void
        +getMedicalHistoryByStepId(req, res): void
    }
    
    class DocumentUploadController {
        +uploadDocument(req, res): void
        +getDocumentById(req, res): void
        +deleteDocument(req, res): void
    }
    
    class ChatController {
        +askMedicalAI(req, res): void
        +sendMessage(req, res): void
        +getConversation(req, res): void
    }
    
    class UserRoutes {
        +GET api-user-get
        +GET api-user-id
        +PUT api-user-id
        +DELETE api-user-id
        +POST api-user-login
        +POST api-user-register
        +PUT api-user-updateprofile
        +PUT api-user-updatepassword
    }
    
    class AppointmentRoutes {
        +GET api-appointments
        +POST api-appointments-create
        +GET api-appointments-id
        +PUT api-appointments-id-status
        +PUT api-appointments-id-cancel
        +PUT api-appointments-id-confirm
        +GET api-appointments-today
        +GET api-appointments-patient-patientId
    }
    
    class DoctorRoutes {
        +GET api-doctorProfile-id
        +POST api-doctorProfile-create
        +PUT api-doctorProfile-id
        +GET api-doctorProfile-specialties-specialtyId
        +GET api-doctorProfile-doctors
    }
    
    class PatientRoutes {
        +GET api-patient
        +GET api-patient-id
        +POST api-patient
        +PUT api-patient-id
    }
    
    class HealthPackageRoutes {
        +GET api-healthPackage
        +POST api-healthPackage-admin-create
        +PUT api-healthPackage-admin-update-id
        +DELETE api-healthPackage-admin-id
        +PUT api-healthPackage-admin-lockstatus-id
    }
    
    class MedicalProcessRoutes {
        +GET api-medicalProcess-getAll
        +POST api-medicalProcess-create
        +GET api-medicalProcess-id
        +POST api-medicalProcess-updateStatus-id
        +GET api-medicalProcess-by-appointment-appointmentId
        +POST api-medicalProcess-step-create
        +POST api-medicalProcess-step-update-notes-stepId
    }
    
    class SpecialtyRoutes {
        +GET api-specialty
        +POST api-specialty-create
        +PUT api-specialty-id
        +DELETE api-specialty-id
        +GET api-specialty-id
    }
    
    class NewsRoutes {
        +GET api-news
        +POST api-news
        +PUT api-news-id
        +DELETE api-news-id
        +GET api-news-id
    }
    
    class PaymentRoutes {
        +GET api-payment
        +POST api-payment
        +GET api-payment-appointment-appointmentId
        +PUT api-payment-id
    }
    
    class PayOSRoutes {
        +POST api-payos-create
        +POST api-payos-status
    }
    
    class NotificationRoutes {
        +POST api-notifications
        +GET api-notifications-userId
        +PUT api-notifications-id-read
    }
    
    class StaffRoutes {
        +GET api-staff
        +POST api-staff
        +PUT api-staff-id
        +DELETE api-staff-id
    }
    
    class RoomRoutes {
        +GET api-room
        +POST api-room
        +PUT api-room-id
        +DELETE api-room-id
        +PUT api-room-id-toggle-status
    }
    
    class ServiceRoutes {
        +GET api-service
        +POST api-service
        +PUT api-service-id
        +DELETE api-service-id
    }
    
    class ScheduleRoutes {
        +GET api-schedules-all
        +POST api-schedules
        +PUT api-schedules-id
        +DELETE api-schedules-id
        +GET api-schedules-nursing
    }
    
    class MedicalHistoryRoutes {
        +GET api-medicalHistory-getAll
        +POST api-medicalHistory-create
        +GET api-medicalHistory-getByPatientId-id
        +GET api-medicalHistory-getByStepId-stepId
    }
    
    class DocumentUploadRoutes {
        +POST api-documents-upload
        +GET api-documents-id
        +DELETE api-documents-id
    }
    
    class ChatRoutes {
        +POST api-chat-ask
        +POST api-chat-message
        +GET api-chat-conversation-id
    }
    
    HomePage --> SpecialtyService : uses
    HomePage --> HealthPackageService : uses
    HomePage --> DoctorService : uses
    HomePage --> NewsService : uses
    
    LoginPage --> UserService : uses
    RegisterPage --> UserService : uses
    
    AppointmentBookingPage --> AppointmentService : uses
    AppointmentBookingPage --> SpecialtyService : uses
    AppointmentBookingPage --> DoctorService : uses
    AppointmentBookingPage --> HealthPackageService : uses
    
    DoctorDetailPage --> DoctorService : uses
    PatientDetailPage --> PatientService : uses
    PatientDetailPage --> AppointmentService : uses
    PatientDetailPage --> MedicalProcessService : uses
    
    CreateHealthPackagePage --> HealthPackageService : uses
    CreateHealthPackagePage --> SpecialtyService : uses
    
    CreateMedicalProcessPage --> MedicalProcessService : uses
    CreateMedicalProcessPage --> PatientService : uses
    
    StatisticalPage --> AppointmentService : uses
    StatisticalPage --> PatientService : uses
    StatisticalPage --> PaymentService : uses
    
    NewsCard --> NewsService : uses
    NotificationDropdown --> NotificationService : uses
    
    UserService --> UserRoutes : calls
    AppointmentService --> AppointmentRoutes : calls
    DoctorService --> DoctorRoutes : calls
    PatientService --> PatientRoutes : calls
    HealthPackageService --> HealthPackageRoutes : calls
    MedicalProcessService --> MedicalProcessRoutes : calls
    SpecialtyService --> SpecialtyRoutes : calls
    NewsService --> NewsRoutes : calls
    PaymentService --> PaymentRoutes : calls
    PayOSService --> PayOSRoutes : calls
    NotificationService --> NotificationRoutes : calls
    
    UserRoutes --> UserController : routes to
    AppointmentRoutes --> AppointmentController : routes to
    DoctorRoutes --> DoctorController : routes to
    PatientRoutes --> PatientController : routes to
    HealthPackageRoutes --> HealthPackageController : routes to
    MedicalProcessRoutes --> MedicalProcessController : routes to
    SpecialtyRoutes --> SpecialtyController : routes to
    NewsRoutes --> NewsController : routes to
    PaymentRoutes --> PaymentController : routes to
    PayOSRoutes --> PayOSController : routes to
    NotificationRoutes --> NotificationController : routes to
    StaffRoutes --> StaffController : routes to
    RoomRoutes --> RoomController : routes to
    ServiceRoutes --> ServiceController : routes to
    ScheduleRoutes --> ScheduleController : routes to
    MedicalHistoryRoutes --> MedicalHistoryController : routes to
    DocumentUploadRoutes --> DocumentUploadController : routes to
    ChatRoutes --> ChatController : routes to
    
    UserController --> User : creates/updates/queries
    AppointmentController --> Appointment : creates/updates/queries
    DoctorController --> DoctorProfile : creates/updates/queries
    DoctorController --> User : queries
    PatientController --> User : creates/updates/queries
    HealthPackageController --> HealthPackage : creates/updates/queries
    MedicalProcessController --> MedicalProcess : creates/updates/queries
    MedicalProcessController --> ProcessStep : creates/updates/queries
    SpecialtyController --> Specialty : creates/updates/queries
    NewsController --> News : creates/updates/queries
    PaymentController --> Payment : creates/updates/queries
    PayOSController --> Payment : creates/updates/queries
    NotificationController --> Notification : creates/updates/queries
    StaffController --> User : creates/updates/queries
    RoomController --> Room : creates/updates/queries
    ServiceController --> ParaclinicalService : creates/updates/queries
    ScheduleController --> Schedule : creates/updates/queries
    ScheduleController --> User : queries
    MedicalHistoryController --> MedicalHistory : creates/updates/queries
    DocumentUploadController --> DocumentUpload : creates/updates/queries
    ChatController --> Conversation : creates/updates/queries
    ChatController --> Message : creates/updates/queries
    
    User ||--o{ Appointment : "patientId"
    User ||--o{ Appointment : "doctorId"
    User ||--o{ DoctorProfile : "doctorId"
    User ||--o{ MedicalProcess : "doctorId"
    User ||--o{ MedicalHistory : "patientId"
    User ||--o{ Notification : "userId"
    User ||--o{ Schedule : "userId"
    User ||--o{ Review : "patientId"
    User ||--o{ Conversation : "paticipants"
    User ||--o{ Message : "senderId"
    
    Appointment ||--o{ MedicalProcess : "appointmentId"
    Appointment ||--o{ Payment : "appointmentId"
    Appointment ||--o{ Remind : "appointmentId"
    
    Specialty ||--o{ DoctorProfile : "specialties"
    Specialty ||--o{ HealthPackage : "specialties"
    Specialty ||--o{ ParaclinicalService : "specialty"
    Specialty ||--o{ Appointment : "specialties"
    
    HealthPackage ||--o{ Appointment : "healthPackage"
    HealthPackage ||--o{ ParaclinicalService : "service"
    
    MedicalProcess ||--o{ ProcessStep : "processSteps"
    MedicalProcess ||--o{ MedicalHistory : "processStep"
    
    ProcessStep ||--o{ MedicalHistory : "processStep"
    ProcessStep ||--o{ ParaclinicalService : "serviceId"
    
    Room ||--o{ Specialty : "room"
    Room ||--o{ ParaclinicalService : "room"
    Room ||--o{ Schedule : "room"
    Room ||--o{ User : "patientQueue"
    
    Conversation ||--o{ Message : "conversationId"
    
    DocumentUpload ||--o{ DoctorProfile : "certificateId"
    DocumentUpload ||--o{ Specialty : "documentId"
    DocumentUpload ||--o{ MedicalHistory : "resultFiles"
    DocumentUpload ||--o{ News : "mediaRef"
    
    HomePage --> SpecialtyCard : renders
    HomePage --> NewsCard : renders
    
    Header --> NotificationDropdown : contains
    Header --> ProtectedRoute : uses
    
    class AdminLayout {
        +children: ReactNode
        +render(): JSX
    }
    
    class DoctorLayout {
        +children: ReactNode
        +render(): JSX
    }
    
    class MainLayout {
        +children: ReactNode
        +render(): JSX
    }
    
    class ReceptionistLayout {
        +children: ReactNode
        +render(): JSX
    }
    
    class TechnicianLayout {
        +children: ReactNode
        +render(): JSX
    }
    
    AdminLayout --> Header : contains
    AdminLayout --> AdminNavSidebar : contains
    DoctorLayout --> Header : contains
    DoctorLayout --> DoctorNavSideBar : contains
    MainLayout --> Header : contains
    MainLayout --> Footer : contains
    ReceptionistLayout --> Header : contains
    ReceptionistLayout --> ReceptionistNavSidebar : contains
    TechnicianLayout --> Header : contains
    TechnicianLayout --> TechnicianNavSidebar : contains
    
    class AdminNavSidebar {
        +render(): JSX
    }
    
    class DoctorNavSideBar {
        +render(): JSX
    }
    
    class ReceptionistNavSidebar {
        +render(): JSX
    }
    
    class TechnicianNavSidebar {
        +render(): JSX
    }
    
    class AuthenticateMiddleware {
        +authenticate(req, res, next): void
        +checkRole(roles): Function
    }
    
    class UploadMiddleware {
        +upload(): Function
        +handleUpload(): void
    }
    
    UserRoutes --> AuthenticateMiddleware : uses
    AppointmentRoutes --> AuthenticateMiddleware : uses
    DoctorRoutes --> AuthenticateMiddleware : uses
    StaffRoutes --> UploadMiddleware : uses
    DocumentUploadRoutes --> UploadMiddleware : uses
    
    class SocketHandler {
        +handleConnection(socket): void
        +handleDisconnect(socket): void
        +handleMessage(socket, data): void
    }
    
    class DatabaseConfig {
        +connect(): Promise
        +disconnect(): Promise
    }
    
    class PassportConfig {
        +configure(): void
        +serializeUser(): void
        +deserializeUser(): void
    }
    
    subgraph "Frontend Layer"
        HomePage
        LoginPage
        RegisterPage
        AppointmentBookingPage
        DoctorDetailPage
        PatientDetailPage
        CreateHealthPackagePage
        CreateMedicalProcessPage
        StatisticalPage
        Header
        Footer
        BannerName
        SpecialtyCard
        NewsCard
        NotificationDropdown
        ProtectedRoute
        ConfirmationModal
        AdminLayout
        DoctorLayout
        MainLayout
        ReceptionistLayout
        TechnicianLayout
        AdminNavSidebar
        DoctorNavSideBar
        ReceptionistNavSidebar
        TechnicianNavSidebar
    end
    
    subgraph "Frontend Services"
        UserService
        AppointmentService
        DoctorService
        PatientService
        HealthPackageService
        MedicalProcessService
        SpecialtyService
        NewsService
        PaymentService
        PayOSService
        NotificationService
        ChatService
    end
    
    subgraph "Backend Routes"
        UserRoutes
        AppointmentRoutes
        DoctorRoutes
        PatientRoutes
        HealthPackageRoutes
        MedicalProcessRoutes
        SpecialtyRoutes
        NewsRoutes
        PaymentRoutes
        PayOSRoutes
        NotificationRoutes
        StaffRoutes
        RoomRoutes
        ServiceRoutes
        ScheduleRoutes
        MedicalHistoryRoutes
        DocumentUploadRoutes
        ChatRoutes
    end
    
    subgraph "Backend Controllers"
        UserController
        AppointmentController
        DoctorController
        PatientController
        HealthPackageController
        MedicalProcessController
        SpecialtyController
        NewsController
        PaymentController
        PayOSController
        NotificationController
        StaffController
        RoomController
        ServiceController
        ScheduleController
        MedicalHistoryController
        DocumentUploadController
        ChatController
    end
    
    subgraph "Backend Models"
        User
        Appointment
        DoctorProfile
        Specialty
        HealthPackage
        MedicalProcess
        ProcessStep
        MedicalHistory
        News
        Payment
        Notification
        Room
        ParaclinicalService
        DocumentUpload
        Schedule
        Conversation
        Message
        Review
        Remind
    end
    
    subgraph "Backend Infrastructure"
        AuthenticateMiddleware
        UploadMiddleware
        SocketHandler
        DatabaseConfig
        PassportConfig
    end 