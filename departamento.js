import { readAllDepartamentos, createDepartamento, updateDepartamento, deleteDepartamento } from './controlador.js';

document.addEventListener('DOMContentLoaded', () => {
    const departamentoTableBody = document.getElementById('departamentoTableBody');
    const departamentoModal = new bootstrap.Modal(document.getElementById('departamentoModal'));
    const departamentoForm = document.getElementById('departamentoForm');
    const departamentoIdInput = document.getElementById('departamentoId');
    const nomeDepartamentoInput = document.getElementById('nomeDepartamento');
    const saveDepartamentoButton = document.getElementById('saveDepartamentoButton');
    const feedbackMessage = document.getElementById('feedbackMessage');
    let editMode = false;

    const loadDepartamentos = async () => {
        const departamentos = await readAllDepartamentos();
        departamentoTableBody.innerHTML = '';
        departamentos.forEach(departamento => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${departamento.departamentoId}</td>
                <td>${departamento.departamentoNome}</td>
                <td>
                    <button class="btn btn-black btn-sm updateDepartamentoButton" data-id="${departamento.departamentoId}">Atualizar</button>
                    <button class="btn btn-red btn-sm deleteDepartamentoButton" data-id="${departamento.departamentoId}">Deletar</button>
                </td>
            `;
            departamentoTableBody.appendChild(row);
        });
    };

    const showMessage = (message, isSuccess = true) => {
        feedbackMessage.textContent = message;
        feedbackMessage.classList.remove('d-none', 'alert-success', 'alert-danger');
        feedbackMessage.classList.add(isSuccess ? 'alert-success' : 'alert-danger');
        setTimeout(() => feedbackMessage.classList.add('d-none'), 3000);
    };

    document.getElementById('createDepartamentoButton').addEventListener('click', () => {
        departamentoModal.show();
        departamentoForm.reset();
        editMode = false;
        document.getElementById('departamentoModalLabel').textContent = 'Criar Departamento';
    });

    departamentoTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('updateDepartamentoButton')) {
            const id = e.target.getAttribute('data-id');
            const departamento = (await readAllDepartamentos()).find(d => d.departamentoId == id);
            departamentoIdInput.value = departamento.departamentoId;
            nomeDepartamentoInput.value = departamento.departamentoNome;
            editMode = true;
            document.getElementById('departamentoModalLabel').textContent = 'Atualizar Departamento';
            departamentoModal.show();
        }
    });

    saveDepartamentoButton.addEventListener('click', async () => {
        const departamentoId = departamentoIdInput.value;
        const departamentoNome = nomeDepartamentoInput.value;

        try {
            if (editMode) {
                await updateDepartamento(departamentoId, { departamentoNome });
                showMessage('Departamento atualizado com sucesso!');
            } else {
                await createDepartamento({ departamentoNome });
                showMessage('Departamento criado com sucesso!');
            }
            departamentoModal.hide();
            loadDepartamentos();
        } catch (error) {
            showMessage('Erro ao salvar departamento!', false);
        }
    });

    departamentoTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('deleteDepartamentoButton')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Tem certeza que deseja deletar este departamento?')) {
                try {
                    await deleteDepartamento(id);
                    showMessage('Departamento deletado com sucesso!');
                    loadDepartamentos();
                } catch (error) {
                    showMessage('Erro ao deletar departamento!', false);
                }
            }
        }
    });

    loadDepartamentos();
});
