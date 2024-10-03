import { readAllFalhas, readAllDepartamentos } from './controlador.js';

let chartInstance;

async function initializeDepartamentos() {
    const departamentoDropdown = document.getElementById('departamentoSelect');
    const departamentos = await readAllDepartamentos();

    departamentoDropdown.innerHTML = '<option value="0">Todos</option>';

    departamentos.forEach(departamento => {
        departamentoDropdown.innerHTML += `<option value="${departamento.departamentoId}">${departamento.departamentoNome}</option>`;
    });
}

async function renderBarChart() {
    const falhas = await readAllFalhas();
    const failureTypesCount = {};

    falhas.forEach(falha => {
        const tipoFalhaNome = falha.falhaTipo;

        if (!failureTypesCount[tipoFalhaNome]) {
            failureTypesCount[tipoFalhaNome] = { count: 0, name: tipoFalhaNome };
        }
        failureTypesCount[tipoFalhaNome].count++;
    });

    const labels = Object.values(failureTypesCount).map(item => item.name);
    const data = Object.values(failureTypesCount).map(item => item.count);
    
    const context = document.getElementById('falhasChart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(context, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Falhas por Tipo',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.querySelector("#botaoFiltrar").addEventListener("click", ()=>{
    const departamento = document.getElementById('departamentoSelect').value;
    const date = document.getElementById('dataFiltro').value;
    if(departamento == 0){
        renderTable(date, null);
    }else{
        renderTable(date, departamento);
    }
});

async function renderTable(date = null, departamento = null) {
    const falhas = await readAllFalhas();
    const tableBody = document.getElementById('errorTableBody');

    const failureTypesCount = {};

    falhas.forEach(falha => {
        if(date && !departamento && date!=falha.falhaDataOcorrida){            
            return;           
        }else if(!date && departamento && departamento!=falha.falhaDepartamento.departamentoId){
            return;
        }else if(date && departamento && (date!=falha.falhaDataOcorrida || departamento!=falha.falhaDepartamento.departamentoId)){
            return;
        }
        const tipoFalhaNome = falha.falhaTipo;

        if (!failureTypesCount[tipoFalhaNome]) {
            failureTypesCount[tipoFalhaNome] = 0; // Inicializa contador para o tipo de falha
        }
        failureTypesCount[tipoFalhaNome]++; // Incrementa contador
    });

    tableBody.innerHTML = ''; // Limpa o corpo da tabela

    // Adiciona cada tipo de falha e sua contagem na tabela
    for (const tipoFalha in failureTypesCount) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tipoFalha}</td>
            <td>${failureTypesCount[tipoFalha]}</td>
        `;
        tableBody.appendChild(row);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeDepartamentos();
    await renderBarChart();
});
