export interface AttendanceRecord {
  id: string;
  userId: string;
  courseId: string;
  sessionId?: string;
  
  attendanceDate: Date;
  clockIn: Date;
  clockOut?: Date;
  totalMinutes: number;
  
  status: 'present' | 'absent' | 'tardy' | 'excused';
  excuseReason?: string;
  excuseDocumentUrl?: string;
  
  ipAddress?: string;
  location?: string;
  verifiedBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceCreateInput {
  userId: string;
  courseId: string;
  sessionId?: string;
  attendanceDate: Date;
  clockIn: Date;
  status?: 'present' | 'tardy';
}

export interface AttendanceClockOutInput {
  clockOut: Date;
}

export interface AttendanceExcuseInput {
  status: 'excused';
  excuseReason: string;
  excuseDocumentUrl?: string;
}
