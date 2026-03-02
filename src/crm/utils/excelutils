/**
 * Utilidad para exportar datos JSON a formato Excel (.xls) 
 * utilizando el truco de la tabla HTML para evitar dependencias pesadas.
 */
export const downloadExcel = (data, fileName) => {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    
    // Crear tabla HTML
    let html = '<table><thead><tr>';
    headers.forEach(h => {
        html += `<th style="background-color: #3b82f6; color: white; font-weight: bold; border: 1px solid #ccc;">${h.toUpperCase()}</th>`;
    });
    html += '</tr></thead><tbody>';

    data.forEach(row => {
        html += '<tr>';
        headers.forEach(h => {
            const val = row[h] === null || row[h] === undefined ? '' : row[h];
            html += `<td style="border: 1px solid #ccc;">${val}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';

    // Blob con MIME type de Excel antiguo para que lo abra directo
    const blob = new Blob(['\ufeff', html], {
        type: 'application/vnd.ms-excel'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName.endsWith('.xls') ? fileName : `${fileName}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
