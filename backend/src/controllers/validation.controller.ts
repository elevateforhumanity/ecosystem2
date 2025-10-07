import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dataValidationService } from '../services/validation.service';

export async function validateRecord(req: AuthRequest, res: Response) {
  try {
    const { type } = req.params;
    const data = req.body;
    
    let result;
    
    switch (type) {
      case 'eligibility':
        result = dataValidationService.validateEligibility(data);
        break;
      case 'attendance':
        result = dataValidationService.validateAttendance(data);
        break;
      case 'employment':
        result = dataValidationService.validateEmploymentOutcome(data);
        break;
      case 'iep':
        result = dataValidationService.validateIEP(data);
        break;
      case 'skillGain':
        result = dataValidationService.validateSkillGain(data);
        break;
      case 'financial':
        result = dataValidationService.validateFinancialRecord(data);
        break;
      case 'supportService':
        result = dataValidationService.validateSupportService(data);
        break;
      case 'placement':
        result = dataValidationService.validatePlacement(data);
        break;
      case 'retentionCheck':
        result = dataValidationService.validateRetentionCheck(data);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_TYPE', message: 'Invalid validation type' }
        });
    }
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function validateBatch(req: AuthRequest, res: Response) {
  try {
    const { type } = req.params;
    const { records } = req.body;
    
    if (!Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Records must be an array' }
      });
    }
    
    const { results, summary } = dataValidationService.validateBatch(type, records);
    
    res.json({ success: true, data: { results, summary } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getValidationRules(req: AuthRequest, res: Response) {
  try {
    const { type } = req.params;
    
    const rules: Record<string, any> = {
      eligibility: {
        required: ['userId', 'eligibilityCategory', 'enrollmentDate'],
        optional: ['documentationUrl', 'employmentStatus', 'educationLevel'],
        validValues: {
          eligibilityCategory: ['adult', 'dislocated_worker', 'youth']
        }
      },
      attendance: {
        required: ['userId', 'courseId', 'date'],
        optional: ['hoursAttended', 'status', 'notes'],
        validValues: {
          status: ['present', 'absent', 'excused', 'late']
        }
      },
      employment: {
        required: ['userId', 'employerId', 'jobTitle', 'startDate'],
        optional: ['wage', 'wageType', 'hoursPerWeek', 'benefits'],
        validValues: {
          wageType: ['hourly', 'annual']
        }
      },
      iep: {
        required: ['userId', 'caseManagerId', 'careerGoal'],
        optional: ['targetOccupation', 'currentSkills', 'skillGaps', 'trainingPrograms'],
        validValues: {}
      },
      skillGain: {
        required: ['userId', 'gainType', 'gainDate'],
        optional: ['description', 'evidenceUrl', 'verifiedBy'],
        validValues: {
          gainType: ['educational_functioning_level', 'secondary_diploma', 'secondary_transcript', 
                     'training_milestone', 'skills_progression', 'credential']
        }
      },
      financial: {
        required: ['userId', 'fundingSource', 'fiscalYear', 'allocatedAmount', 'budgetCategory'],
        optional: ['grantNumber', 'programId'],
        validValues: {
          budgetCategory: ['training', 'support_services', 'administration', 'equipment', 'other']
        }
      },
      supportService: {
        required: ['userId', 'serviceType', 'serviceProvider', 'description'],
        optional: ['needAssessment', 'cost', 'fundingSource'],
        validValues: {
          serviceType: ['transportation', 'childcare', 'housing', 'medical', 'mental_health', 
                       'substance_abuse', 'legal', 'financial_literacy', 'job_search', 'other']
        }
      },
      placement: {
        required: ['userId', 'employerId', 'jobTitle', 'startDate', 'employmentType', 'wage', 'wageType'],
        optional: ['hoursPerWeek', 'benefits', 'notes'],
        validValues: {
          employmentType: ['full_time', 'part_time', 'contract', 'temporary'],
          wageType: ['hourly', 'annual']
        }
      },
      retentionCheck: {
        required: ['quarter', 'employed', 'contactMethod'],
        optional: ['wage', 'hoursPerWeek', 'notes'],
        validValues: {
          quarter: [1, 2, 3, 4],
          contactMethod: ['phone', 'email', 'in_person', 'survey']
        }
      }
    };
    
    if (!type || !rules[type]) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TYPE', message: 'Invalid validation type' }
      });
    }
    
    res.json({ success: true, data: rules[type] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getAvailableValidators(req: AuthRequest, res: Response) {
  try {
    const validators = [
      { type: 'eligibility', name: 'Eligibility Validation', description: 'Validates participant eligibility records' },
      { type: 'attendance', name: 'Attendance Validation', description: 'Validates attendance records' },
      { type: 'employment', name: 'Employment Validation', description: 'Validates employment outcome records' },
      { type: 'iep', name: 'IEP Validation', description: 'Validates Individual Employment Plans' },
      { type: 'skillGain', name: 'Skill Gain Validation', description: 'Validates measurable skill gain records' },
      { type: 'financial', name: 'Financial Validation', description: 'Validates financial records' },
      { type: 'supportService', name: 'Support Service Validation', description: 'Validates support service records' },
      { type: 'placement', name: 'Placement Validation', description: 'Validates job placement records' },
      { type: 'retentionCheck', name: 'Retention Check Validation', description: 'Validates retention check records' }
    ];
    
    res.json({ success: true, data: validators });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}
