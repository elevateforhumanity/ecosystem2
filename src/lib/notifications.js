// Mock notification data generator for development
export function generateMockNotifications() {
  const types = ['info', 'success', 'warning', 'error', 'message', 'course', 'certificate'];
  const titles = {
    info: ['System Update', 'New Feature Available', 'Maintenance Notice'],
    success: ['Course Completed', 'Certificate Earned', 'Assignment Submitted'],
    warning: ['Deadline Approaching', 'Payment Due', 'Profile Incomplete'],
    error: ['Login Failed', 'Upload Error', 'Connection Lost'],
    message: ['New Message', 'Instructor Reply', 'Peer Comment'],
    course: ['New Course Available', 'Course Updated', 'Enrollment Confirmed'],
    certificate: ['Certificate Ready', 'Certificate Verified', 'Certificate Shared'],
  };
  
  const messages = {
    info: ['Check out the latest updates to the platform', 'New features have been added', 'Scheduled maintenance on Sunday'],
    success: ['Congratulations on completing the course!', 'Your certificate is now available', 'Your assignment was submitted successfully'],
    warning: ['Your assignment is due in 2 days', 'Payment is due by end of month', 'Please complete your profile'],
    error: ['Unable to log in. Please try again', 'File upload failed', 'Connection to server lost'],
    message: ['You have a new message from John', 'Your instructor replied to your question', 'Sarah commented on your post'],
    course: ['Introduction to AI is now available', 'Course materials have been updated', 'You are now enrolled in Web Development'],
    certificate: ['Your certificate is ready to download', 'Certificate verification complete', 'Your certificate was shared successfully'],
  };

  const notifications = [];
  const now = Date.now();
  
  for (let i = 0; i < 10; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const titleOptions = titles[type];
    const messageOptions = messages[type];
    
    notifications.push({
      id: `notif-${i}`,
      type,
      title: titleOptions[Math.floor(Math.random() * titleOptions.length)],
      message: messageOptions[Math.floor(Math.random() * messageOptions.length)],
      timestamp: now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time within last 7 days
      read: Math.random() > 0.5,
    });
  }
  
  return notifications.sort((a, b) => b.timestamp - a.timestamp);
}

// Notification service for managing notifications
export class NotificationService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  notify(listeners) {
    this.listeners.forEach((callback) => callback(this.notifications));
  }

  add(notification) {
    const newNotification = {
      id: `notif-${Date.now()}`,
      timestamp: Date.now(),
      read: false,
      ...notification,
    };
    this.notifications.unshift(newNotification);
    this.notify();
    return newNotification.id;
  }

  markAsRead(id) {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this.notify();
    }
  }

  markAllAsRead() {
    this.notifications.forEach((n) => {
      n.read = true;
    });
    this.notify();
  }

  remove(id) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  getUnreadCount() {
    return this.notifications.filter((n) => !n.read).length;
  }

  getAll() {
    return this.notifications;
  }
}

export const notificationService = new NotificationService();
