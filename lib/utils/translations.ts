import { Language } from '../store/languageStore';

export const dictionary = {
  EN: {
    // Navigation
    home: 'Home',
    myBooking: 'My Booking',
    aboutUs: 'About Us',
    contact: 'Contact',
    help: 'Help',
    signIn: 'Sign In',
    register: 'Register',
    myDashboard: 'My Dashboard',
    agentDashboard: 'Agent Dashboard',
    adminPanel: 'Admin Panel',
    logout: 'Logout',
    customerSupport: 'Customer Support',

    // Agent Portal Sidebar
    dashboard: 'Dashboard',
    myTicket: 'My Ticket',
    myBulkTicket: 'My Bulk Ticket',
    myCounter: 'My Counter',
    commission: 'Commission',
    statement: 'Statement',
    myProfile: 'My Profile',
    referral: 'Referral',
    setting: 'Setting',
    sellNewTicket: 'Sell New Ticket',
    sellTicket: 'Sell Ticket',
    mySoldTickets: 'My Sold Tickets',
    myBulkOrders: 'My Bulk Orders',

    // Agent Dashboard
    welcome: 'Welcome',
    assignedCounter: 'Assigned Counter',
    referralCode: 'Referral Code',
    totalTicketsBought: 'Total Tickets Bought',
    remainingTickets: 'Remaining Tickets',
    ticketsSold: 'Tickets Sold',
    commissionEarned: 'Commission Earned',
    referralEarnings: 'Referral Earnings',
    totalInvested: 'Total Invested',

    // Search Box & Travel
    leavingFrom: 'Leaving From',
    goingTo: 'Going To',
    selectCity: 'Select City',
    departureDate: 'Departure Date',
    searchBuses: 'Search Buses',
    today: 'Today',
    tomorrow: 'Tomorrow',
    popularRoutes: 'Popular Routes',
    allDepartureTimes: 'All Departure Times',
    availableBuses: 'Available Bus Schedules',

    // General
    earn: 'Earn',
    agentPortal: 'Agent Portal',
    active: 'Active',
    agentNavigation: 'Agent Navigation',
  },
  BN: {
    // Navigation
    home: 'হোম',
    myBooking: 'আমার বুকিং',
    aboutUs: 'আমাদের সম্পর্কে',
    contact: 'যোগাযোগ',
    help: 'সাহায্য',
    signIn: 'সাইন ইন',
    register: 'রেজিস্টার',
    myDashboard: 'মাই ড্যাশবোর্ড',
    agentDashboard: 'এজেন্ট ড্যাশবোর্ড',
    adminPanel: 'এডমিন প্যানেল',
    logout: 'লগআউট',
    customerSupport: 'কাস্টমার সাপোর্ট',

    // Agent Portal Sidebar
    dashboard: 'ড্যাশবোর্ড',
    myTicket: 'আমার টিকিট',
    myBulkTicket: 'আমার বাল্ক টিকিট',
    myCounter: 'আমার কাউন্টার',
    commission: 'কমিশন',
    statement: 'স্টেটমেন্ট',
    myProfile: 'আমার প্রোফাইল',
    referral: 'রেফারেল',
    setting: 'সেটিংস',
    sellNewTicket: 'নতুন টিকিট বিক্রি',
    sellTicket: 'টিকিট বিক্রি করুন',
    mySoldTickets: 'আমার বিক্রীত টিকিট',
    myBulkOrders: 'আমার বাল্ক অর্ডার',

    // Agent Dashboard
    welcome: 'স্বাগতম',
    assignedCounter: 'বরাদ্দকৃত কাউন্টার',
    referralCode: 'রেফারেল কোড',
    totalTicketsBought: 'মোট টিকিট কেনা',
    remainingTickets: 'অবশিষ্ট টিকিট',
    ticketsSold: 'টিকিট বিক্রি',
    commissionEarned: 'অর্জিত কমিশন',
    referralEarnings: 'রেফারেল আয়',
    totalInvested: 'মোট বিনিয়োগ',

    // Search Box & Travel
    leavingFrom: 'কোথা থেকে',
    goingTo: 'কোথায় যাবেন',
    selectCity: 'শহর নির্বাচন করুন',
    departureDate: 'যাত্রার তারিখ',
    searchBuses: 'বাস খুঁজুন',
    today: 'আজ',
    tomorrow: 'আগামীকাল',
    popularRoutes: 'জনপ্রিয় রুটসমূহ',
    allDepartureTimes: 'সকল ছাড়ার সময়',
    availableBuses: 'উপলব্ধ বাস সময়সূচী',

    // General
    earn: 'আয়',
    agentPortal: 'এজেন্ট পোর্টাল',
    active: 'সক্রিয়',
    agentNavigation: 'এজেন্ট নেভিগেশন',
  },
};

export type TranslationKey = keyof typeof dictionary.EN;

export function getTranslation(lang: Language, key: TranslationKey, fallback?: string): string {
  return dictionary[lang]?.[key] || fallback || dictionary.EN[key] || key;
}
