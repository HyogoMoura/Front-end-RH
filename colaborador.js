import { readAllFuncionario, createFuncionario, updateFuncionario, deleteFuncionario, readAllDepartamentos } from './controlador.js';


document.addEventListener('DOMContentLoaded', () => {
    const colaboradorTableBody = document.getElementById('funcionarioTableBody');
    const colaboradorModal = new bootstrap.Modal(document.getElementById('funcionarioModal'));
    const colaboradorForm = document.getElementById('funcionarioForm');
    const colaboradorIdInput = document.getElementById('funcionarioId');
    const nomeColaboradorInput = document.getElementById('nomeFuncionario');
    const emailColaboradorInput = document.getElementById('emailFuncionario');
    const matriculaColaboradorInput = document.getElementById('matriculaFuncionario');
    const departamentoColaboradorSelect = document.getElementById('departamentoFuncionario');
    const saveColaboradorButton = document.getElementById('saveFuncionarioButton');
    const feedbackMessage = document.getElementById('feedbackMessage');
    let editMode = false;

    const loadColaboradores = async () => {
        const colaboradores = await readAllFuncionario();
        const departamentos = await readAllDepartamentos();
        const departamentoMap = departamentos.reduce((map, departamento) => {
            map[departamento.departamentoId] = departamento.departamentoNome;
            return map;
        }, {});

        colaboradorTableBody.innerHTML = '';
        colaboradores.forEach(colaborador => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${colaborador.funcionarioId}</td>
                <td>${colaborador.funcionarioNome}</td>
                <td>${colaborador.funcionarioEmail}</td>
                <td>${colaborador.funcionarioRegistro}</td>
                <td>${departamentoMap[colaborador.funcionarioDepartamento.departamentoId]}</td>
                <td>
                    <button class="btn btn-black btn-sm updateFuncionarioButton" data-id="${colaborador.funcionarioId}">Atualizar</button>
                    <button class="btn btn-red btn-sm deleteFuncionarioButton" data-id="${colaborador.funcionarioId}">Deletar</button>
                </td>
            `;
            colaboradorTableBody.appendChild(row);
        });
    };

    const loadDepartamentosSelect = async () => {
        const departamentos = await readAllDepartamentos();
        departamentoColaboradorSelect.innerHTML = '';
        departamentos.forEach(departamento => {
            const option = document.createElement('option');
            option.value = departamento.departamentoId;
            option.textContent = departamento.departamentoNome;
            departamentoColaboradorSelect.appendChild(option);
        });
    };

    const showMessage = (message, isSuccess = true) => {
        feedbackMessage.textContent = message;
        feedbackMessage.classList.remove('d-none', 'alert-success', 'alert-danger');
        feedbackMessage.classList.add(isSuccess ? 'alert-success' : 'alert-danger');
        setTimeout(() => feedbackMessage.classList.add('d-none'), 3000);
    };

    document.getElementById('createFuncionarioButton').addEventListener('click', async () => {
        await loadDepartamentosSelect();
        colaboradorModal.show();
        colaboradorForm.reset();
        editMode = false;
        document.getElementById('funcionarioModalLabel').textContent = 'Criar Colaborador';
    });

    colaboradorTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('updateFuncionarioButton')) {
            const id = e.target.getAttribute('data-id');
            const colaborador = (await readAllFuncionario()).find(c => c.funcionarioId == id);
            colaboradorIdInput.value = colaborador.funcionarioId;
            nomeColaboradorInput.value = colaborador.funcionarioNome;
            emailColaboradorInput.value = colaborador.funcionarioEmail;
            matriculaColaboradorInput.value = colaborador.funcionarioRegistro;
            await loadDepartamentosSelect();
            departamentoColaboradorSelect.value = colaborador.funcionarioDepartamento.departamentoId;
            editMode = true;
            document.getElementById('funcionarioModalLabel').textContent = 'Atualizar Colaborador';
            colaboradorModal.show();
        }
    });

    saveColaboradorButton.addEventListener('click', async () => {
        const funcionarioId = colaboradorIdInput.value;
        const funcionarioNome = nomeColaboradorInput.value;
        const funcionarioEmail = emailColaboradorInput.value;
        const funcionarioRegistro = matriculaColaboradorInput.value;
        const funcionarioDepartamento = { departamentoId: departamentoColaboradorSelect.value };

        try {
            if (editMode) {
                await updateFuncionario(funcionarioId, { funcionarioNome, funcionarioEmail, funcionarioRegistro, funcionarioDepartamento });
                showMessage('Colaborador atualizado com sucesso!');
            } else {
                await createFuncionario({ funcionarioNome, funcionarioEmail, funcionarioRegistro, funcionarioDepartamento });
                showMessage('Colaborador criado com sucesso!');
            }
            colaboradorModal.hide();
            loadColaboradores();
        } catch (error) {
            showMessage('Erro ao salvar colaborador!', false);
        }
    });

    colaboradorTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('deleteFuncionarioButton')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Tem certeza que deseja deletar este colaborador?')) {
                try {
                    await deleteFuncionario(id);
                    showMessage('Colaborador deletado com sucesso!');
                    loadColaboradores();
                } catch (error) {
                    showMessage('Erro ao deletar colaborador!', false);
                }
            }
        }
    });

    loadColaboradores();
});
