import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { reportingService } from '../services/reporting.service';

export async function generatePIRLReport(req: AuthRequest, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'MISSING_PARAMS', message: 'startDate and endDate are required' } 
      });
    }
    
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    const records = await reportingService.generatePIRLReport(start, end);
    
    res.json({ success: true, data: records });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function exportPIRLReport(req: AuthRequest, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'MISSING_PARAMS', message: 'startDate and endDate are required' } 
      });
    }
    
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    const records = await reportingService.generatePIRLReport(start, end);
    const csv = await reportingService.exportPIRLToCSV(records);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=pirl-report-${startDate}-${endDate}.csv`);
    res.send(csv);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function generateETA9130Report(req: AuthRequest, res: Response) {
  try {
    const { quarter, year } = req.query;
    
    if (!quarter || !year) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'MISSING_PARAMS', message: 'quarter and year are required' } 
      });
    }
    
    const q = parseInt(quarter as string);
    const y = parseInt(year as string);
    
    if (q < 1 || q > 4) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'INVALID_QUARTER', message: 'Quarter must be between 1 and 4' } 
      });
    }
    
    const report = await reportingService.generateETA9130Report(q, y);
    
    res.json({ success: true, data: report });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function generateETA9169Report(req: AuthRequest, res: Response) {
  try {
    const { fiscalYear, quarter } = req.query;
    
    if (!fiscalYear || !quarter) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'MISSING_PARAMS', message: 'fiscalYear and quarter are required' } 
      });
    }
    
    const fy = parseInt(fiscalYear as string);
    const q = parseInt(quarter as string);
    
    if (q < 1 || q > 4) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'INVALID_QUARTER', message: 'Quarter must be between 1 and 4' } 
      });
    }
    
    const report = await reportingService.generateETA9169Report(fy, q);
    
    res.json({ success: true, data: report });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}

export async function getAvailableReports(req: AuthRequest, res: Response) {
  try {
    const reports = [
      {
        id: 'pirl',
        name: 'PIRL (Participant Individual Record Layout)',
        description: 'Individual participant data for federal reporting',
        parameters: ['startDate', 'endDate'],
        formats: ['json', 'csv']
      },
      {
        id: 'eta-9130',
        name: 'ETA-9130 Financial Report',
        description: 'Quarterly financial and performance report',
        parameters: ['quarter', 'year'],
        formats: ['json']
      },
      {
        id: 'eta-9169',
        name: 'ETA-9169 WIOA Performance Report',
        description: 'WIOA program performance metrics',
        parameters: ['fiscalYear', 'quarter'],
        formats: ['json']
      }
    ];
    
    res.json({ success: true, data: reports });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
}
