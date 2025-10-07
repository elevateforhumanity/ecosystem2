export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export class DataValidationService {
  // Eligibility Validation
  validateEligibility(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Required fields
    if (!data.userId) {
      errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.eligibilityCategory) {
      errors.push({ field: 'eligibilityCategory', message: 'Eligibility category is required', code: 'REQUIRED_FIELD' });
    } else if (!['adult', 'dislocated_worker', 'youth'].includes(data.eligibilityCategory)) {
      errors.push({ field: 'eligibilityCategory', message: 'Invalid eligibility category', code: 'INVALID_VALUE' });
    }
    
    if (!data.enrollmentDate) {
      errors.push({ field: 'enrollmentDate', message: 'Enrollment date is required', code: 'REQUIRED_FIELD' });
    } else {
      const enrollmentDate = new Date(data.enrollmentDate);
      if (enrollmentDate > new Date()) {
        errors.push({ field: 'enrollmentDate', message: 'Enrollment date cannot be in the future', code: 'INVALID_DATE' });
      }
    }
    
    // Warnings
    if (!data.documentationUrl) {
      warnings.push({ field: 'documentationUrl', message: 'Documentation URL is recommended for audit purposes', code: 'MISSING_DOCUMENTATION' });
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
  
  // Attendance Validation
  validateAttendance(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (!data.userId) {
      errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.courseId) {
      errors.push({ field: 'courseId', message: 'Course ID is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.date) {
      errors.push({ field: 'date', message: 'Date is required', code: 'REQUIRED_FIELD' });
    } else {
      const attendanceDate = new Date(data.date);
      if (attendanceDate > new Date()) {
        errors.push({ field: 'date', message: 'Attendance date cannot be in the future', code: 'INVALID_DATE' });
      }
    }
    
    if (data.hoursAttended !== undefined) {
      if (data.hoursAttended < 0) {
        errors.push({ field: 'hoursAttended', message: 'Hours attended cannot be negative', code: 'INVALID_VALUE' });
      }
      if (data.hoursAttended > 24) {
        warnings.push({ field: 'hoursAttended', message: 'Hours attended exceeds 24 hours in a day', code: 'UNUSUAL_VALUE' });
      }
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
  
  // Employment Outcomes Validation
  validateEmploymentOutcome(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (!data.userId) {
      errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.employerId) {
      errors.push({ field: 'employerId', message: 'Employer ID is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.jobTitle) {
      errors.push({ field: 'jobTitle', message: 'Job title is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.startDate) {
      errors.push({ field: 'startDate', message: 'Start date is required', code: 'REQUIRED_FIELD' });
    }
    
    if (data.wage !== undefined) {
      if (data.wage < 0) {
        errors.push({ field: 'wage', message: 'Wage cannot be negative', code: 'INVALID_VALUE' });
      }
      if (data.wageType === 'hourly' && data.wage < 7.25) {
        warnings.push({ field: 'wage', message: 'Wage is below federal minimum wage', code: 'LOW_WAGE' });
      }
      if (data.wageType === 'hourly' && data.wage > 200) {
        warnings.push({ field: 'wage', message: 'Hourly wage seems unusually high', code: 'UNUSUAL_VALUE' });
      }
    }
    
    if (data.hoursPerWeek !== undefined) {
      if (data.hoursPerWeek < 0) {
        errors.push({ field: 'hoursPerWeek', message: 'Hours per week cannot be negative', code: 'INVALID_VALUE' });
      }
      if (data.hoursPerWeek > 80) {
        warnings.push({ field: 'hoursPerWeek', message: 'Hours per week exceeds 80', code: 'UNUSUAL_VALUE' });
      }
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
  
  // IEP Validation
  validateIEP(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (!data.userId) {
      errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.caseManagerId) {
      errors.push({ field: 'caseManagerId', message: 'Case manager ID is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.careerGoal) {
      errors.push({ field: 'careerGoal', message: 'Career goal is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.currentSkills || data.currentSkills.length === 0) {
      warnings.push({ field: 'currentSkills', message: 'Current skills should be documented', code: 'MISSING_DATA' });
    }
    
    if (!data.skillGaps || data.skillGaps.length === 0) {
      warnings.push({ field: 'skillGaps', message: 'Skill gaps should be identified', code: 'MISSING_DATA' });
    }
    
    if (!data.trainingPrograms || data.trainingPrograms.length === 0) {
      warnings.push({ field: 'trainingPrograms', message: 'Training programs should be specified', code: 'MISSING_DATA' });
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
  
  // Skill Gains Validation
  validateSkillGain(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (!data.userId) {
      errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.gainType) {
      errors.push({ field: 'gainType', message: 'Gain type is required', code: 'REQUIRED_FIELD' });
    } else if (!['educational_functioning_level', 'secondary_diploma', 'secondary_transcript', 
                  'training_milestone', 'skills_progression', 'credential'].includes(data.gainType)) {
      errors.push({ field: 'gainType', message: 'Invalid gain type', code: 'INVALID_VALUE' });
    }
    
    if (!data.gainDate) {
      errors.push({ field: 'gainDate', message: 'Gain date is required', code: 'REQUIRED_FIELD' });
    } else {
      const gainDate = new Date(data.gainDate);
      if (gainDate > new Date()) {
        errors.push({ field: 'gainDate', message: 'Gain date cannot be in the future', code: 'INVALID_DATE' });
      }
    }
    
    if (!data.description) {
      warnings.push({ field: 'description', message: 'Description is recommended for documentation', code: 'MISSING_DATA' });
    }
    
    if (!data.evidenceUrl) {
      warnings.push({ field: 'evidenceUrl', message: 'Evidence URL is recommended for verification', code: 'MISSING_DOCUMENTATION' });
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
  
  // Financial Record Validation
  validateFinancialRecord(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (!data.userId) {
      errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.fundingSource) {
      errors.push({ field: 'fundingSource', message: 'Funding source is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.fiscalYear) {
      errors.push({ field: 'fiscalYear', message: 'Fiscal year is required', code: 'REQUIRED_FIELD' });
    } else {
      const currentYear = new Date().getFullYear();
      if (data.fiscalYear < currentYear - 5 || data.fiscalYear > currentYear + 1) {
        warnings.push({ field: 'fiscalYear', message: 'Fiscal year seems unusual', code: 'UNUSUAL_VALUE' });
      }
    }
    
    if (data.allocatedAmount === undefined || data.allocatedAmount === null) {
      errors.push({ field: 'allocatedAmount', message: 'Allocated amount is required', code: 'REQUIRED_FIELD' });
    } else if (data.allocatedAmount < 0) {
      errors.push({ field: 'allocatedAmount', message: 'Allocated amount cannot be negative', code: 'INVALID_VALUE' });
    }
    
    if (!data.budgetCategory) {
      errors.push({ field: 'budgetCategory', message: 'Budget category is required', code: 'REQUIRED_FIELD' });
    } else if (!['training', 'support_services', 'administration', 'equipment', 'other'].includes(data.budgetCategory)) {
      errors.push({ field: 'budgetCategory', message: 'Invalid budget category', code: 'INVALID_VALUE' });
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
  
  // Support Service Validation
  validateSupportService(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (!data.userId) {
      errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.serviceType) {
      errors.push({ field: 'serviceType', message: 'Service type is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.serviceProvider) {
      errors.push({ field: 'serviceProvider', message: 'Service provider is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.description) {
      errors.push({ field: 'description', message: 'Description is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.needAssessment) {
      warnings.push({ field: 'needAssessment', message: 'Need assessment is recommended', code: 'MISSING_DATA' });
    }
    
    if (data.cost !== undefined && data.cost < 0) {
      errors.push({ field: 'cost', message: 'Cost cannot be negative', code: 'INVALID_VALUE' });
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
  
  // Placement Validation
  validatePlacement(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (!data.userId) {
      errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.employerId) {
      errors.push({ field: 'employerId', message: 'Employer ID is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.jobTitle) {
      errors.push({ field: 'jobTitle', message: 'Job title is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.startDate) {
      errors.push({ field: 'startDate', message: 'Start date is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.employmentType) {
      errors.push({ field: 'employmentType', message: 'Employment type is required', code: 'REQUIRED_FIELD' });
    }
    
    if (data.wage === undefined || data.wage === null) {
      errors.push({ field: 'wage', message: 'Wage is required', code: 'REQUIRED_FIELD' });
    } else if (data.wage < 0) {
      errors.push({ field: 'wage', message: 'Wage cannot be negative', code: 'INVALID_VALUE' });
    }
    
    if (!data.wageType) {
      errors.push({ field: 'wageType', message: 'Wage type is required', code: 'REQUIRED_FIELD' });
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
  
  // Retention Check Validation
  validateRetentionCheck(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (!data.quarter) {
      errors.push({ field: 'quarter', message: 'Quarter is required', code: 'REQUIRED_FIELD' });
    } else if (![1, 2, 3, 4].includes(data.quarter)) {
      errors.push({ field: 'quarter', message: 'Quarter must be 1, 2, 3, or 4', code: 'INVALID_VALUE' });
    }
    
    if (data.employed === undefined || data.employed === null) {
      errors.push({ field: 'employed', message: 'Employment status is required', code: 'REQUIRED_FIELD' });
    }
    
    if (!data.contactMethod) {
      errors.push({ field: 'contactMethod', message: 'Contact method is required', code: 'REQUIRED_FIELD' });
    }
    
    if (data.employed && !data.wage) {
      warnings.push({ field: 'wage', message: 'Wage should be documented for employed participants', code: 'MISSING_DATA' });
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }
  
  // Batch validation
  validateBatch(type: string, records: any[]): { results: ValidationResult[], summary: any } {
    const results = records.map(record => {
      switch (type) {
        case 'eligibility': return this.validateEligibility(record);
        case 'attendance': return this.validateAttendance(record);
        case 'employment': return this.validateEmploymentOutcome(record);
        case 'iep': return this.validateIEP(record);
        case 'skillGain': return this.validateSkillGain(record);
        case 'financial': return this.validateFinancialRecord(record);
        case 'supportService': return this.validateSupportService(record);
        case 'placement': return this.validatePlacement(record);
        case 'retentionCheck': return this.validateRetentionCheck(record);
        default: return { valid: false, errors: [{ field: 'type', message: 'Unknown validation type', code: 'UNKNOWN_TYPE' }], warnings: [] };
      }
    });
    
    const summary = {
      total: records.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0)
    };
    
    return { results, summary };
  }
}

export const dataValidationService = new DataValidationService();
