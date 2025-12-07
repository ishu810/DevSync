import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

// Export to CSV
export const exportToCSV = (data, filename = 'export') => {
  if (!data || data.length === 0) {
    alert('No data available for export');
    return;
  }

  try {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('CSV export error:', error);
    alert('CSV export failed. Please try again.');
  }
};

// Export to JSON
export const exportToJSON = (data, filename = 'export') => {
  if (!data || data.length === 0) {
    alert('No data available for export');
    return;
  }

  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('JSON export error:', error);
    alert('JSON export failed. Please try again.');
  }
};

// Export to PDF - Simplified version
export const exportToPDF = (data, filename = 'export', title = 'Data Export') => {
  if (!data || data.length === 0) {
    alert('No data available for export');
    return;
  }

  try {
    // Import jsPDF dynamically
    import('jspdf').then((jsPDFModule) => {
      const { jsPDF } = jsPDFModule;
      
      // Import autoTable dynamically
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        // Add title
        doc.setFontSize(16);
        doc.text(title, 14, 15);
        
        // Add date
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
        
        // Prepare table data
        const headers = data.length > 0 ? Object.keys(data[0]) : [];
        const tableData = data.map(item => headers.map(header => String(item[header] || '')));
        
        // Add table
        doc.autoTable({
          head: [headers],
          body: tableData,
          startY: 30,
          styles: {
            fontSize: 8,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
          },
          margin: { top: 30, left: 14, right: 14 },
        });
        
        // Save PDF
        doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
      }).catch((error) => {
        console.error('AutoTable import error:', error);
        alert('PDF table generation failed. Please try again.');
      });
    }).catch((error) => {
      console.error('jsPDF import error:', error);
      alert('PDF generation failed. Please try again.');
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('PDF generation failed. Please try again.');
  }
};

// Export complaints data with custom formatting
export const exportComplaintsData = (complaints, format, filename = 'complaints') => {
  // Transform complaints data for better export format
  const transformedData = complaints.map(complaint => ({
    'Complaint ID': complaint._id || 'N/A',
    'Title': complaint.title || 'N/A',
    'Description': complaint.description || 'N/A',
    'Category': complaint.category || 'N/A',
    'Status': complaint.status || 'N/A',
    'Priority': complaint.priority || 'N/A',
    'Created Date': complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A',
    'Updated Date': complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleDateString() : 'N/A',
    'Deadline': complaint.deadline ? new Date(complaint.deadline).toLocaleDateString() : 'N/A',
    'Assigned To': complaint.assigned_to?.username || 'Unassigned',
    'Submitted By': complaint.submitted_by?.username || 'N/A',
    'Location': complaint.location || 'N/A',
    'SLA Violation': complaint.slaViolation ? 'Yes' : 'No',
  }));

  switch (format.toLowerCase()) {
    case 'csv':
      exportToCSV(transformedData, filename);
      break;
    case 'json':
      exportToJSON(transformedData, filename);
      break;
    case 'pdf':
      exportToPDF(transformedData, filename, 'Complaints Report');
      break;
    default:
      alert('Invalid export format. Please choose CSV, JSON, or PDF.');
  }
};

// Export users data with custom formatting
export const exportUsersData = (users, format, filename = 'users') => {
  const transformedData = users.map(user => ({
    'User ID': user._id || 'N/A',
    'Username': user.username || 'N/A',
    'Email': user.email || 'N/A',
    'Role': user.role || 'N/A',
    'Created Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    'Last Updated': user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A',
  }));

  switch (format.toLowerCase()) {
    case 'csv':
      exportToCSV(transformedData, filename);
      break;
    case 'json':
      exportToJSON(transformedData, filename);
      break;
    case 'pdf':
      exportToPDF(transformedData, filename, 'Users Report');
      break;
    default:
      alert('Invalid export format. Please choose CSV, JSON, or PDF.');
  }
};

// Export dashboard statistics
export const exportDashboardStats = (stats, format, filename = 'dashboard_stats') => {
  const statsData = [
    {
      'Metric': 'Total Complaints',
      'Value': stats.total || 0,
    },
    {
      'Metric': 'Open Complaints',
      'Value': stats.open || 0,
    },
    {
      'Metric': 'In Progress',
      'Value': stats.inProgress || 0,
    },
    {
      'Metric': 'Resolved',
      'Value': stats.resolved || 0,
    },
    {
      'Metric': 'Closed',
      'Value': stats.closed || 0,
    },
    {
      'Metric': 'SLA Violations',
      'Value': stats.slaViolations || 0,
    },
  ];

  switch (format.toLowerCase()) {
    case 'csv':
      exportToCSV(statsData, filename);
      break;
    case 'json':
      exportToJSON(statsData, filename);
      break;
    case 'pdf':
      exportToPDF(statsData, filename, 'Dashboard Statistics');
      break;
    default:
      alert('Invalid export format. Please choose CSV, JSON, or PDF.');
  }
};
