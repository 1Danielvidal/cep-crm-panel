export function downloadCSV(data, filename = 'reporte.csv') {
    if (!data || !data.length) {
        alert("No hay datos para exportar");
        return;
    }

    // Cabeceras
    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Agregar fila de cabeceras
    csvRows.push(headers.join(','));

    // Formatear filas
    for (const row of data) {
        const values = headers.map(header => {
            let val = row[header];
            // Escapar comillas dobles y comas si es string
            if (typeof val === 'string') {
                val = val.replace(/"/g, '""'); // Escapar comillas
                if (val.includes(',') || val.includes('\n') || val.includes('"')) {
                    val = `"${val}"`; // Envolver en comillas
                }
            } else if (val === null || val === undefined) {
                val = '';
            }
            return val;
        });
        csvRows.push(values.join(','));
    }

    // Unir todo con saltos de línea y agregar BOM (para que Excel reconozca UTF-8 en español)
    const csvContent = "\uFEFF" + csvRows.join('\n');

    // Crear el blob y el link de descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
