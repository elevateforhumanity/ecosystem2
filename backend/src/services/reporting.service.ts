import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface PIRLRecord {
  participantId: string;
  ssn?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  ethnicity: string;
  race: string[];
  
  programType: string;
  enrollmentDate: Date;
  exitDate?: Date;
  
  eligibilityCategory: string;
  employmentStatus: string;
  educationLevel: string;
  
  servicesReceived: string[];
  
  employmentOutcome?: {
    employed: boolean;
    employerId?: string;
    jobTitle?: string;
    wage?: number;
    hoursPerWeek?: number;
    startDate?: Date;
  };
  
  skillGains: number;
  credentialsAttained: string[];
  
  retention2ndQuarter?: boolean;
  retention4thQuarter?: boolean;
}

export interface ETA9130Report {
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
    quarter: number;
    year: number;
  };
  
  participants: {
    totalEnrolled: number;
    totalExited: number;
    activeParticipants: number;
  };
  
  demographics: {
    byGender: Record<string, number>;
    byAge: Record<string, number>;
    byRace: Record<string, number>;
    byEthnicity: Record<string, number>;
  };
  
  eligibility: {
    byCategory: Record<string, number>;
  };
  
  services: {
    byType: Record<string, number>;
  };
  
  outcomes: {
    enteredEmployment: number;
    retainedEmployment2Q: number;
    retainedEmployment4Q: number;
    averageWage: number;
    credentialsAttained: number;
    measurableSkillGains: number;
  };
  
  expenditures: {
    totalSpent: number;
    byCategory: Record<string, number>;
  };
}

export interface ETA9169Report {
  reportingPeriod: {
    fiscalYear: number;
    quarter: number;
  };
  
  costs: {
    totalCosts: number;
    participantCosts: number;
    administrativeCosts: number;
  };
  
  participants: {
    totalServed: number;
    adultParticipants: number;
    dislocatedWorkerParticipants: number;
    youthParticipants: number;
  };
  
  outcomes: {
    employmentRate: number;
    medianEarnings: number;
    credentialAttainmentRate: number;
    measurableSkillGainsRate: number;
  };
  
  performance: {
    employmentRateGoal: number;
    employmentRateActual: number;
    medianEarningsGoal: number;
    medianEarningsActual: number;
    credentialRateGoal: number;
    credentialRateActual: number;
  };
}

export class ReportingService {
  async generatePIRLReport(startDate: Date, endDate: Date): Promise<PIRLRecord[]> {
    const query = `
      SELECT 
        u.id as participant_id,
        u.first_name,
        u.last_name,
        u.date_of_birth,
        u.gender,
        u.ethnicity,
        u.race,
        e.eligibility_category,
        e.employment_status,
        e.education_level,
        e.enrollment_date,
        e.exit_date,
        emp.job_title,
        emp.wage,
        emp.hours_per_week,
        emp.start_date as employment_start_date
      FROM users u
      LEFT JOIN eligibility e ON u.id = e.user_id
      LEFT JOIN placements emp ON u.id = emp.user_id AND emp.status = 'active'
      WHERE e.enrollment_date BETWEEN $1 AND $2
      ORDER BY e.enrollment_date
    `;
    
    const result = await pool.query(query, [startDate, endDate]);
    
    const pirlRecords: PIRLRecord[] = [];
    
    for (const row of result.rows) {
      // Get services received
      const servicesQuery = `
        SELECT DISTINCT service_type 
        FROM support_services 
        WHERE user_id = $1 AND approval_status = 'approved'
      `;
      const services = await pool.query(servicesQuery, [row.participant_id]);
      
      // Get skill gains
      const skillGainsQuery = `
        SELECT COUNT(*) as count 
        FROM skill_gains 
        WHERE user_id = $1 AND verified = true
      `;
      const skillGains = await pool.query(skillGainsQuery, [row.participant_id]);
      
      // Get retention data
      const retentionQuery = `
        SELECT retention_checks 
        FROM placements 
        WHERE user_id = $1 AND status IN ('active', 'completed')
      `;
      const retention = await pool.query(retentionQuery, [row.participant_id]);
      
      let retention2Q = false;
      let retention4Q = false;
      
      if (retention.rows.length > 0) {
        const checks = JSON.parse(retention.rows[0].retention_checks || '[]');
        retention2Q = checks.some((c: any) => c.quarter === 2 && c.employed);
        retention4Q = checks.some((c: any) => c.quarter === 4 && c.employed);
      }
      
      pirlRecords.push({
        participantId: row.participant_id,
        firstName: row.first_name,
        lastName: row.last_name,
        dateOfBirth: row.date_of_birth,
        gender: row.gender,
        ethnicity: row.ethnicity,
        race: JSON.parse(row.race || '[]'),
        programType: 'WIOA',
        enrollmentDate: row.enrollment_date,
        exitDate: row.exit_date,
        eligibilityCategory: row.eligibility_category,
        employmentStatus: row.employment_status,
        educationLevel: row.education_level,
        servicesReceived: services.rows.map((s: any) => s.service_type),
        employmentOutcome: row.job_title ? {
          employed: true,
          jobTitle: row.job_title,
          wage: parseFloat(row.wage),
          hoursPerWeek: row.hours_per_week,
          startDate: row.employment_start_date
        } : undefined,
        skillGains: parseInt(skillGains.rows[0].count),
        credentialsAttained: [],
        retention2ndQuarter: retention2Q,
        retention4thQuarter: retention4Q
      });
    }
    
    return pirlRecords;
  }
  
  async generateETA9130Report(quarter: number, year: number): Promise<ETA9130Report> {
    const startDate = new Date(year, (quarter - 1) * 3, 1);
    const endDate = new Date(year, quarter * 3, 0);
    
    // Participant counts
    const participantQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE enrollment_date BETWEEN $1 AND $2) as enrolled,
        COUNT(*) FILTER (WHERE exit_date BETWEEN $1 AND $2) as exited,
        COUNT(*) FILTER (WHERE enrollment_date <= $2 AND (exit_date IS NULL OR exit_date > $2)) as active
      FROM eligibility
    `;
    const participantResult = await pool.query(participantQuery, [startDate, endDate]);
    
    // Demographics
    const demographicsQuery = `
      SELECT 
        u.gender,
        EXTRACT(YEAR FROM AGE($2, u.date_of_birth)) as age,
        u.race,
        u.ethnicity
      FROM users u
      JOIN eligibility e ON u.id = e.user_id
      WHERE e.enrollment_date <= $2 AND (e.exit_date IS NULL OR e.exit_date > $1)
    `;
    const demographics = await pool.query(demographicsQuery, [startDate, endDate]);
    
    const byGender: Record<string, number> = {};
    const byAge: Record<string, number> = {};
    const byRace: Record<string, number> = {};
    const byEthnicity: Record<string, number> = {};
    
    demographics.rows.forEach((row: any) => {
      byGender[row.gender] = (byGender[row.gender] || 0) + 1;
      
      const ageGroup = row.age < 25 ? '18-24' : row.age < 35 ? '25-34' : row.age < 45 ? '35-44' : row.age < 55 ? '45-54' : '55+';
      byAge[ageGroup] = (byAge[ageGroup] || 0) + 1;
      
      const races = JSON.parse(row.race || '[]');
      races.forEach((race: string) => {
        byRace[race] = (byRace[race] || 0) + 1;
      });
      
      byEthnicity[row.ethnicity] = (byEthnicity[row.ethnicity] || 0) + 1;
    });
    
    // Outcomes
    const outcomesQuery = `
      SELECT 
        COUNT(DISTINCT p.user_id) FILTER (WHERE p.start_date BETWEEN $1 AND $2) as entered_employment,
        AVG(p.wage) FILTER (WHERE p.start_date BETWEEN $1 AND $2) as avg_wage,
        COUNT(DISTINCT sg.user_id) FILTER (WHERE sg.gain_date BETWEEN $1 AND $2 AND sg.verified = true) as skill_gains
      FROM placements p
      FULL OUTER JOIN skill_gains sg ON p.user_id = sg.user_id
    `;
    const outcomes = await pool.query(outcomesQuery, [startDate, endDate]);
    
    // Retention
    const retentionQuery = `
      SELECT retention_checks 
      FROM placements 
      WHERE start_date < $1
    `;
    const retention = await pool.query(retentionQuery, [endDate]);
    
    let retained2Q = 0;
    let retained4Q = 0;
    
    retention.rows.forEach((row: any) => {
      const checks = JSON.parse(row.retention_checks || '[]');
      if (checks.some((c: any) => c.quarter === 2 && c.employed)) retained2Q++;
      if (checks.some((c: any) => c.quarter === 4 && c.employed)) retained4Q++;
    });
    
    // Expenditures
    const expendituresQuery = `
      SELECT 
        SUM(spent_amount) as total_spent,
        budget_category,
        SUM(spent_amount) as category_spent
      FROM financial_records
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY budget_category
    `;
    const expenditures = await pool.query(expendituresQuery, [startDate, endDate]);
    
    const byCategory: Record<string, number> = {};
    let totalSpent = 0;
    
    expenditures.rows.forEach((row: any) => {
      const amount = parseFloat(row.category_spent);
      byCategory[row.budget_category] = amount;
      totalSpent += amount;
    });
    
    return {
      reportingPeriod: {
        startDate,
        endDate,
        quarter,
        year
      },
      participants: {
        totalEnrolled: parseInt(participantResult.rows[0].enrolled),
        totalExited: parseInt(participantResult.rows[0].exited),
        activeParticipants: parseInt(participantResult.rows[0].active)
      },
      demographics: {
        byGender,
        byAge,
        byRace,
        byEthnicity
      },
      eligibility: {
        byCategory: {}
      },
      services: {
        byType: {}
      },
      outcomes: {
        enteredEmployment: parseInt(outcomes.rows[0].entered_employment || 0),
        retainedEmployment2Q: retained2Q,
        retainedEmployment4Q: retained4Q,
        averageWage: parseFloat(outcomes.rows[0].avg_wage || 0),
        credentialsAttained: 0,
        measurableSkillGains: parseInt(outcomes.rows[0].skill_gains || 0)
      },
      expenditures: {
        totalSpent,
        byCategory
      }
    };
  }
  
  async generateETA9169Report(fiscalYear: number, quarter: number): Promise<ETA9169Report> {
    const startDate = new Date(fiscalYear, (quarter - 1) * 3, 1);
    const endDate = new Date(fiscalYear, quarter * 3, 0);
    
    // Costs
    const costsQuery = `
      SELECT 
        SUM(spent_amount) as total_spent,
        SUM(spent_amount) FILTER (WHERE budget_category IN ('training', 'support_services')) as participant_costs,
        SUM(spent_amount) FILTER (WHERE budget_category = 'administration') as admin_costs
      FROM financial_records
      WHERE fiscal_year = $1
    `;
    const costs = await pool.query(costsQuery, [fiscalYear]);
    
    // Participants
    const participantsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE eligibility_category = 'adult') as adults,
        COUNT(*) FILTER (WHERE eligibility_category = 'dislocated_worker') as dislocated,
        COUNT(*) FILTER (WHERE eligibility_category = 'youth') as youth
      FROM eligibility
      WHERE enrollment_date BETWEEN $1 AND $2
    `;
    const participants = await pool.query(participantsQuery, [startDate, endDate]);
    
    // Outcomes
    const outcomesQuery = `
      SELECT 
        COUNT(DISTINCT p.user_id) as employed,
        AVG(p.wage) as median_earnings,
        COUNT(DISTINCT sg.user_id) as skill_gains
      FROM placements p
      FULL OUTER JOIN skill_gains sg ON p.user_id = sg.user_id
      WHERE p.start_date BETWEEN $1 AND $2 OR sg.gain_date BETWEEN $1 AND $2
    `;
    const outcomes = await pool.query(outcomesQuery, [startDate, endDate]);
    
    const totalParticipants = parseInt(participants.rows[0].total);
    const employed = parseInt(outcomes.rows[0].employed || 0);
    const skillGains = parseInt(outcomes.rows[0].skill_gains || 0);
    
    return {
      reportingPeriod: {
        fiscalYear,
        quarter
      },
      costs: {
        totalCosts: parseFloat(costs.rows[0].total_spent || 0),
        participantCosts: parseFloat(costs.rows[0].participant_costs || 0),
        administrativeCosts: parseFloat(costs.rows[0].admin_costs || 0)
      },
      participants: {
        totalServed: totalParticipants,
        adultParticipants: parseInt(participants.rows[0].adults || 0),
        dislocatedWorkerParticipants: parseInt(participants.rows[0].dislocated || 0),
        youthParticipants: parseInt(participants.rows[0].youth || 0)
      },
      outcomes: {
        employmentRate: totalParticipants > 0 ? (employed / totalParticipants) * 100 : 0,
        medianEarnings: parseFloat(outcomes.rows[0].median_earnings || 0),
        credentialAttainmentRate: 0,
        measurableSkillGainsRate: totalParticipants > 0 ? (skillGains / totalParticipants) * 100 : 0
      },
      performance: {
        employmentRateGoal: 70,
        employmentRateActual: totalParticipants > 0 ? (employed / totalParticipants) * 100 : 0,
        medianEarningsGoal: 15,
        medianEarningsActual: parseFloat(outcomes.rows[0].median_earnings || 0),
        credentialRateGoal: 60,
        credentialRateActual: 0
      }
    };
  }
  
  async exportPIRLToCSV(records: PIRLRecord[]): Promise<string> {
    const headers = [
      'Participant ID', 'First Name', 'Last Name', 'Date of Birth', 'Gender', 'Ethnicity', 'Race',
      'Program Type', 'Enrollment Date', 'Exit Date', 'Eligibility Category', 'Employment Status',
      'Education Level', 'Services Received', 'Employed', 'Job Title', 'Wage', 'Hours Per Week',
      'Skill Gains', 'Credentials', '2nd Quarter Retention', '4th Quarter Retention'
    ];
    
    const rows = records.map(r => [
      r.participantId,
      r.firstName,
      r.lastName,
      r.dateOfBirth.toISOString().split('T')[0],
      r.gender,
      r.ethnicity,
      r.race.join(';'),
      r.programType,
      r.enrollmentDate.toISOString().split('T')[0],
      r.exitDate ? r.exitDate.toISOString().split('T')[0] : '',
      r.eligibilityCategory,
      r.employmentStatus,
      r.educationLevel,
      r.servicesReceived.join(';'),
      r.employmentOutcome?.employed ? 'Yes' : 'No',
      r.employmentOutcome?.jobTitle || '',
      r.employmentOutcome?.wage || '',
      r.employmentOutcome?.hoursPerWeek || '',
      r.skillGains,
      r.credentialsAttained.join(';'),
      r.retention2ndQuarter ? 'Yes' : 'No',
      r.retention4thQuarter ? 'Yes' : 'No'
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const reportingService = new ReportingService();
