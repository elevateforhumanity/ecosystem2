/**
 * Job Ready Indy (JRI) Brain - SCORM Content Integration
 * Integrates EmployIndy's Content Controller dispatch packages
 * Supports SCORM 2004 3rd Edition and SCORM 1.2
 */

class JRIBrainService {
  constructor() {
    this.courses = new Map();
    this.enrollments = new Map();
    this.completions = new Map();
    this.scormSessions = new Map();
    
    // JRI Course Catalog
    this.jriCourses = [
      {
        id: 'JRI_INTRO',
        title: 'Introduction to JRI',
        order: 1,
        duration: '2 hours',
        audience: 'learners',
        scormPackage: null,
        contentControllerUrl: null
      },
      {
        id: 'JRI_MINDSETS',
        title: 'Mindsets',
        order: 2,
        duration: '3 hours',
        audience: 'learners',
        scormPackage: null,
        contentControllerUrl: null
      },
      {
        id: 'JRI_SELFMGMT',
        title: 'Self-Management',
        order: 3,
        duration: '3 hours',
        audience: 'learners',
        scormPackage: null,
        contentControllerUrl: null
      },
      {
        id: 'JRI_LEARNING',
        title: 'Learning Strategies',
        order: 4,
        duration: '3 hours',
        audience: 'learners',
        scormPackage: null,
        contentControllerUrl: null
      },
      {
        id: 'JRI_SOCIAL',
        title: 'Social Skills',
        order: 5,
        duration: '3 hours',
        audience: 'learners',
        scormPackage: null,
        contentControllerUrl: null
      },
      {
        id: 'JRI_WORKPLACE',
        title: 'Workplace Skills',
        order: 6,
        duration: '4 hours',
        audience: 'learners',
        scormPackage: null,
        contentControllerUrl: null
      },
      {
        id: 'JRI_LAUNCH',
        title: 'Launch A Career',
        order: 7,
        duration: '4 hours',
        audience: 'learners',
        scormPackage: null,
        contentControllerUrl: null
      },
      {
        id: 'JRI_FACILITATION',
        title: 'Facilitation Training',
        order: 8,
        duration: '6 hours',
        audience: 'staff',
        scormPackage: null,
        contentControllerUrl: null,
        restricted: true
      }
    ];

    // SCORM API Configuration
    this.scormVersion = process.env.SCORM_VERSION || '2004';
    this.contentControllerDomain = process.env.JRI_CONTENT_CONTROLLER_DOMAIN || 'cloud.scorm.com';
    
    // Initialize courses
    this.jriCourses.forEach(course => {
      this.courses.set(course.id, course);
    });
  }

  /**
   * Register SCORM package for a JRI course
   */
  registerScormPackage(courseId, packageUrl, metadata = {}) {
    const course = this.courses.get(courseId);
    if (!course) {
      throw new Error(`Course ${courseId} not found`);
    }

    course.scormPackage = {
      url: packageUrl,
      version: metadata.version || this.scormVersion,
      registrationId: metadata.registrationId,
      launchUrl: metadata.launchUrl,
      metadata: metadata
    };

    this.courses.set(courseId, course);
    return course;
  }

  /**
   * Enroll user in JRI course
   */
  enrollUser(userId, courseId, cohort = null) {
    const course = this.courses.get(courseId);
    if (!course) {
      throw new Error(`Course ${courseId} not found`);
    }

    // Check if staff-only course
    if (course.restricted && !this.isStaff(userId)) {
      throw new Error('This course is restricted to staff only');
    }

    const enrollmentId = `enroll_${Date.now()}_${userId}_${courseId}`;
    const enrollment = {
      id: enrollmentId,
      userId,
      courseId,
      cohort,
      enrolledAt: new Date(),
      status: 'active',
      progress: 0,
      attempts: 0,
      lastAccessed: null
    };

    this.enrollments.set(enrollmentId, enrollment);
    return enrollment;
  }

  /**
   * Launch SCORM content
   */
  async launchScormContent(userId, courseId, enrollmentId) {
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment || enrollment.userId !== userId) {
      throw new Error('Invalid enrollment');
    }

    const course = this.courses.get(courseId);
    if (!course || !course.scormPackage) {
      throw new Error('SCORM package not configured for this course');
    }

    // Create SCORM session
    const sessionId = `session_${Date.now()}_${userId}`;
    const session = {
      id: sessionId,
      userId,
      courseId,
      enrollmentId,
      startedAt: new Date(),
      lastActivity: new Date(),
      cmiData: this.initializeCMI(this.scormVersion),
      status: 'active'
    };

    this.scormSessions.set(sessionId, session);

    // Update enrollment
    enrollment.attempts++;
    enrollment.lastAccessed = new Date();
    this.enrollments.set(enrollmentId, enrollment);

    // Return launch data
    return {
      sessionId,
      launchUrl: course.scormPackage.launchUrl || course.scormPackage.url,
      scormVersion: course.scormPackage.version,
      apiEndpoint: `/api/scorm/${sessionId}`,
      cspDomains: [this.contentControllerDomain]
    };
  }

  /**
   * Initialize CMI data structure
   */
  initializeCMI(version) {
    if (version === '2004') {
      return {
        'cmi.completion_status': 'incomplete',
        'cmi.success_status': 'unknown',
        'cmi.score.scaled': null,
        'cmi.score.raw': null,
        'cmi.score.min': 0,
        'cmi.score.max': 100,
        'cmi.session_time': 'PT0H0M0S',
        'cmi.total_time': 'PT0H0M0S',
        'cmi.location': '',
        'cmi.suspend_data': '',
        'cmi.exit': '',
        'cmi.learner_name': '',
        'cmi.learner_id': ''
      };
    } else {
      // SCORM 1.2
      return {
        'cmi.core.lesson_status': 'incomplete',
        'cmi.core.score.raw': null,
        'cmi.core.score.min': 0,
        'cmi.core.score.max': 100,
        'cmi.core.session_time': '00:00:00',
        'cmi.core.total_time': '00:00:00',
        'cmi.core.lesson_location': '',
        'cmi.suspend_data': '',
        'cmi.core.exit': '',
        'cmi.core.student_name': '',
        'cmi.core.student_id': ''
      };
    }
  }

  /**
   * Handle SCORM API calls
   */
  async handleScormAPI(sessionId, method, element, value = null) {
    const session = this.scormSessions.get(sessionId);
    if (!session) {
      return { success: false, error: 'Invalid session' };
    }

    session.lastActivity = new Date();

    switch (method) {
      case 'Initialize':
        return { success: true, value: 'true' };

      case 'GetValue':
        const getValue = session.cmiData[element];
        return { success: true, value: getValue !== undefined ? getValue : '' };

      case 'SetValue':
        session.cmiData[element] = value;
        
        // Check for completion
        if (this.isComplete(session.cmiData, session.scormVersion)) {
          await this.markComplete(session);
        }
        
        return { success: true, value: 'true' };

      case 'Commit':
        // Persist data
        await this.persistScormData(session);
        return { success: true, value: 'true' };

      case 'Terminate':
        session.status = 'terminated';
        await this.persistScormData(session);
        return { success: true, value: 'true' };

      default:
        return { success: false, error: 'Unknown method' };
    }
  }

  /**
   * Check if course is complete
   */
  isComplete(cmiData, version) {
    if (version === '2004') {
      return cmiData['cmi.completion_status'] === 'completed' ||
             cmiData['cmi.success_status'] === 'passed';
    } else {
      const status = cmiData['cmi.core.lesson_status'];
      return status === 'completed' || status === 'passed';
    }
  }

  /**
   * Mark course as complete
   */
  async markComplete(session) {
    const enrollment = this.enrollments.get(session.enrollmentId);
    if (!enrollment) return;

    const completionId = `completion_${Date.now()}_${session.userId}`;
    const completion = {
      id: completionId,
      userId: session.userId,
      courseId: session.courseId,
      enrollmentId: session.enrollmentId,
      sessionId: session.id,
      completedAt: new Date(),
      score: this.extractScore(session.cmiData, session.scormVersion),
      status: this.extractStatus(session.cmiData, session.scormVersion),
      timeSpent: this.extractTime(session.cmiData, session.scormVersion)
    };

    this.completions.set(completionId, completion);

    // Update enrollment
    enrollment.status = 'completed';
    enrollment.progress = 100;
    this.enrollments.set(session.enrollmentId, enrollment);

    return completion;
  }

  /**
   * Extract score from CMI data
   */
  extractScore(cmiData, version) {
    if (version === '2004') {
      return cmiData['cmi.score.scaled'] || cmiData['cmi.score.raw'] || 0;
    } else {
      return cmiData['cmi.core.score.raw'] || 0;
    }
  }

  /**
   * Extract status from CMI data
   */
  extractStatus(cmiData, version) {
    if (version === '2004') {
      return cmiData['cmi.success_status'] || cmiData['cmi.completion_status'];
    } else {
      return cmiData['cmi.core.lesson_status'];
    }
  }

  /**
   * Extract time from CMI data
   */
  extractTime(cmiData, version) {
    if (version === '2004') {
      return cmiData['cmi.total_time'] || 'PT0H0M0S';
    } else {
      return cmiData['cmi.core.total_time'] || '00:00:00';
    }
  }

  /**
   * Persist SCORM data
   */
  async persistScormData(session) {
    // In production, save to database
    this.scormSessions.set(session.id, session);
    return true;
  }

  /**
   * Check if user is staff
   */
  isStaff(userId) {
    // In production, check user role from database
    // For now, return false (implement with your auth system)
    return false;
  }

  /**
   * Get user's JRI progress
   */
  getUserProgress(userId) {
    const userEnrollments = [];
    this.enrollments.forEach(enrollment => {
      if (enrollment.userId === userId) {
        const course = this.courses.get(enrollment.courseId);
        const completion = Array.from(this.completions.values())
          .find(c => c.enrollmentId === enrollment.id);

        userEnrollments.push({
          ...enrollment,
          course: course,
          completion: completion
        });
      }
    });

    return userEnrollments.sort((a, b) => a.course.order - b.course.order);
  }

  /**
   * Get JRI course catalog
   */
  getCatalog(userRole = 'learner') {
    const catalog = [];
    this.courses.forEach(course => {
      if (course.audience === 'learners' || 
          (course.audience === 'staff' && userRole === 'staff')) {
        catalog.push(course);
      }
    });
    return catalog.sort((a, b) => a.order - b.order);
  }

  /**
   * Generate CSP headers for SCORM content
   */
  getCSPHeaders() {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "frame-ancestors 'self'",
        `frame-src 'self' https://${this.contentControllerDomain}`,
        `child-src 'self' https://${this.contentControllerDomain}`,
        `connect-src 'self' https://${this.contentControllerDomain}`,
        "img-src 'self' data: https:",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://${this.contentControllerDomain}",
        "style-src 'self' 'unsafe-inline'"
      ].join('; ')
    };
  }

  /**
   * Generate reporting data
   */
  generateReport(filters = {}) {
    const report = {
      totalEnrollments: 0,
      totalCompletions: 0,
      averageScore: 0,
      completionRate: 0,
      courseBreakdown: []
    };

    // Calculate metrics
    this.courses.forEach(course => {
      const courseEnrollments = Array.from(this.enrollments.values())
        .filter(e => e.courseId === course.id);
      
      const courseCompletions = Array.from(this.completions.values())
        .filter(c => c.courseId === course.id);

      const scores = courseCompletions.map(c => c.score).filter(s => s > 0);
      const avgScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0;

      report.courseBreakdown.push({
        courseId: course.id,
        title: course.title,
        enrollments: courseEnrollments.length,
        completions: courseCompletions.length,
        completionRate: courseEnrollments.length > 0 
          ? (courseCompletions.length / courseEnrollments.length * 100).toFixed(2)
          : 0,
        averageScore: avgScore.toFixed(2)
      });

      report.totalEnrollments += courseEnrollments.length;
      report.totalCompletions += courseCompletions.length;
    });

    report.completionRate = report.totalEnrollments > 0
      ? (report.totalCompletions / report.totalEnrollments * 100).toFixed(2)
      : 0;

    const allScores = Array.from(this.completions.values())
      .map(c => c.score)
      .filter(s => s > 0);
    
    report.averageScore = allScores.length > 0
      ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2)
      : 0;

    return report;
  }
}

module.exports = new JRIBrainService();
