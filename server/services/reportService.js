const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');

// Директория для временных файлов
const REPORTS_DIR = path.join(__dirname, '../../reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// ============ PDF Экспорт ============
const exportToPDF = async (data, filename, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const filepath = path.join(REPORTS_DIR, `${filename}.pdf`);
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Заголовок
      doc.fontSize(20).font('Helvetica-Bold').text(options.title || 'Отчет', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Дата: ${new Date().toLocaleString('ru-RU')}`, { align: 'center' });
      doc.moveDown(1);

      // Информация о компании
      if (options.companyInfo) {
        doc.fontSize(11).font('Helvetica-Bold').text('Информация:');
        Object.entries(options.companyInfo).forEach(([key, value]) => {
          doc.fontSize(10).font('Helvetica').text(`${key}: ${value}`);
        });
        doc.moveDown(1);
      }

      // Таблица данных
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        const tableTop = doc.y;
        const columnWidth = 70;
        const rowHeight = 20;

        // Заголовки столбцов
        doc.font('Helvetica-Bold').fontSize(10);
        columns.forEach((col, i) => {
          doc.text(col, 50 + i * columnWidth, tableTop, {
            width: columnWidth,
            align: 'left',
          });
        });

        // Данные
        doc.font('Helvetica').fontSize(9);
        data.forEach((row, rowIndex) => {
          const y = tableTop + (rowIndex + 1) * rowHeight;
          columns.forEach((col, colIndex) => {
            let value = row[col];
            if (value instanceof Date) {
              value = value.toLocaleDateString('ru-RU');
            }
            doc.text(String(value || ''), 50 + colIndex * columnWidth, y, {
              width: columnWidth,
              align: 'left',
            });
          });
        });
      }

      // Подпись
      if (options.footer) {
        doc.moveDown(2).fontSize(9).text(options.footer, { align: 'center', color: '#666' });
      }

      doc.end();

      stream.on('finish', () => {
        resolve(filepath);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// ============ Excel Экспорт ============
const exportToExcel = async (data, filename, options = {}) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(options.sheetName || 'Отчет');

    if (!data || data.length === 0) {
      worksheet.addRow(['Нет данных для экспорта']);
      const filepath = path.join(REPORTS_DIR, `${filename}.xlsx`);
      await workbook.xlsx.writeFile(filepath);
      return filepath;
    }

    // Получаем заголовки
    const columns = Object.keys(data[0]);
    worksheet.columns = columns.map((col) => ({
      header: col,
      key: col,
      width: 18,
    }));

    // Стили заголовка
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Добавляем данные
    data.forEach((row) => {
      const formattedRow = {};
      Object.entries(row).forEach(([key, value]) => {
        if (value instanceof Date) {
          formattedRow[key] = value.toLocaleDateString('ru-RU');
        } else {
          formattedRow[key] = value;
        }
      });
      worksheet.addRow(formattedRow);
    });

    // Выравнивание и обрезка
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
      });
    });

    // Добавляем информацию
    if (options.companyInfo) {
      worksheet.insertRow(1);
      worksheet.getCell('A1').value = options.title || 'Отчет';
      worksheet.getCell('A1').font = { bold: true, size: 14 };
      worksheet.insertRow(2);
      worksheet.getCell('A2').value = `Дата создания: ${new Date().toLocaleString('ru-RU')}`;
    }

    const filepath = path.join(REPORTS_DIR, `${filename}.xlsx`);
    await workbook.xlsx.writeFile(filepath);
    return filepath;
  } catch (error) {
    throw error;
  }
};

// ============ CSV Экспорт ============
const exportToCSV = async (data, filename, options = {}) => {
  try {
    if (!data || data.length === 0) {
      const filepath = path.join(REPORTS_DIR, `${filename}.csv`);
      fs.writeFileSync(filepath, 'Нет данных для экспорта');
      return filepath;
    }

    const columns = Object.keys(data[0]).map((col) => ({
      id: col,
      title: col,
    }));

    // Форматируем данные
    const formattedData = data.map((row) => {
      const formatted = {};
      Object.entries(row).forEach(([key, value]) => {
        if (value instanceof Date) {
          formatted[key] = value.toLocaleDateString('ru-RU');
        } else if (typeof value === 'object') {
          formatted[key] = JSON.stringify(value);
        } else {
          formatted[key] = value;
        }
      });
      return formatted;
    });

    const filepath = path.join(REPORTS_DIR, `${filename}.csv`);
    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: columns,
      encoding: 'utf8',
    });

    await csvWriter.writeRecords(formattedData);
    return filepath;
  } catch (error) {
    throw error;
  }
};

// ============ JSON Экспорт ============
const exportToJSON = async (data, filename, options = {}) => {
  try {
    const filepath = path.join(REPORTS_DIR, `${filename}.json`);
    const output = {
      title: options.title || 'Отчет',
      createdAt: new Date().toISOString(),
      ...(options.companyInfo && { companyInfo: options.companyInfo }),
      data: data || [],
      totalRecords: data ? data.length : 0,
    };

    fs.writeFileSync(filepath, JSON.stringify(output, null, 2), 'utf8');
    return filepath;
  } catch (error) {
    throw error;
  }
};

// ============ Генерация отчетов ============
const generateReport = async (type, data, filename, options = {}) => {
  try {
    let filepath;

    switch (type.toLowerCase()) {
      case 'pdf':
        filepath = await exportToPDF(data, filename, options);
        break;
      case 'excel':
      case 'xlsx':
        filepath = await exportToExcel(data, filename, options);
        break;
      case 'csv':
        filepath = await exportToCSV(data, filename, options);
        break;
      case 'json':
        filepath = await exportToJSON(data, filename, options);
        break;
      default:
        throw new Error(`Unsupported export type: ${type}`);
    }

    return filepath;
  } catch (error) {
    console.error(`Error generating ${type} report:`, error);
    throw error;
  }
};

// ============ Удаление старых отчетов ============
const cleanupOldReports = (maxAgeHours = 24) => {
  try {
    const files = fs.readdirSync(REPORTS_DIR);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    files.forEach((file) => {
      const filepath = path.join(REPORTS_DIR, file);
      const stat = fs.statSync(filepath);
      const fileAge = now - stat.mtimeMs;

      if (fileAge > maxAge) {
        fs.unlinkSync(filepath);
        console.log(`Deleted old report: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up old reports:', error);
  }
};

// Запуск очистки каждый час
setInterval(() => cleanupOldReports(24), 60 * 60 * 1000);

module.exports = {
  exportToPDF,
  exportToExcel,
  exportToCSV,
  exportToJSON,
  generateReport,
  cleanupOldReports,
  REPORTS_DIR,
};