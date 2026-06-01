import { createClient } from "https://esm.sh/@supabase/supabase-js"
const supabase = createClient('https://kamjqsmvxqfogrsppfou.supabase.co', 'sb_publishable_lseolM209T2zqNOBzu0_PQ_byLzxnO9')

let editingOngId     = null
let editingUserId    = null
let editingProdutoId = null

// ===================== VALIDAÇÕES =====================

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i)
  let digito1 = (soma * 10) % 11
  if (digito1 === 10 || digito1 === 11) digito1 = 0
  if (digito1 !== parseInt(cpf[9])) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i)
  let digito2 = (soma * 10) % 11
  if (digito2 === 10 || digito2 === 11) digito2 = 0
  return digito2 === parseInt(cpf[10])
}

function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '')
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false

  const calcDigito = (cnpj, pesos) => {
    const soma = cnpj.split('').slice(0, pesos.length)
      .reduce((acc, d, i) => acc + parseInt(d) * pesos[i], 0)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  return calcDigito(cnpj, pesos1) === parseInt(cnpj[12]) &&
         calcDigito(cnpj, pesos2) === parseInt(cnpj[13])
}

function validarTelefone(telefone) {
  const digits = telefone.replace(/\D/g, '')

  if (digits.length !== 10 && digits.length !== 11) return false

  const ddd = parseInt(digits.substring(0, 2))
  const dddsValidos = [
    11,12,13,14,15,16,17,18,19,
    21,22,24,27,28,
    31,32,33,34,35,37,38,
    41,42,43,44,45,46,47,48,49,
    51,53,54,55,
    61,62,63,64,65,66,67,68,69,
    71,73,74,75,77,79,
    81,82,83,84,85,86,87,88,89,
    91,92,93,94,95,96,97,98,99
  ]
  if (!dddsValidos.includes(ddd)) return false

  if (digits.length === 11 && digits[2] !== '9') return false

  return true
}

// ===================== ONGs =====================

async function getOngsUpdateHtml() {
  const listaOngs = document.querySelector("#divCardsOngs")
  if (!listaOngs) return

  let { data, error } = await supabase.from('empresas').select('*')
  if (error) { console.error(error); return }

  listaOngs.innerHTML = ''
  data.forEach(element => {
    const card = document.createElement("div")
    card.classList.add('card')
    card.innerHTML = `
      <h3>${element.nome}</h3>
      <p>Email: ${element.email}</p>
      <p>CNPJ: ${element.cnpj}</p>
      <p>Área: ${element.area}</p>
      <div class="card-actions">
        <button class="btn-edit btn-secondary" data-editongid="${element.id}">Editar</button>
        <button class="btn-delete btn-danger" data-ongid="${element.id}">Excluir</button>
      </div>`
    listaOngs.appendChild(card)
  })
}

async function editOng(id) {
  const { data, error } = await supabase
    .from('empresas').select('*').eq('id', id).single()

  if (error) { console.error(error); return }

  document.querySelector('#ong-nome').value     = data.nome     || ''
  document.querySelector('#ong-email').value    = data.email    || ''
  document.querySelector('#ong-cnpj').value     = data.cnpj     || ''
  document.querySelector('#ong-telefone').value = data.telefone || ''
  document.querySelector('#ong-area').value     = data.area     || ''

  document.querySelector('#ong-form-title').textContent = 'Editar'
  editingOngId = id
  document.querySelector('#add-edit-ong-form').style.display = 'block'
}

async function saveOng() {
  const nome     = document.querySelector('#ong-nome').value
  const email    = document.querySelector('#ong-email').value
  const cnpj     = document.querySelector('#ong-cnpj').value
  const telefone = document.querySelector('#ong-telefone').value
  const area     = document.querySelector('#ong-area').value

  if (cnpj && !validarCNPJ(cnpj)) {
    alert('CNPJ inválido. Verifique os dígitos informados.')
    return
  }

  if (telefone && !validarTelefone(telefone)) {
    alert('Telefone inválido. Use DDD + número (ex: 81999998888).')
    return
  }

  if (editingOngId) {
    const { error } = await supabase
      .from('empresas')
      .update({ nome, email, cnpj, telefone, area })
      .eq('id', editingOngId)

    if (error) {
      console.error('Erro Supabase:', JSON.stringify(error))
      alert('Erro ao atualizar ONG: ' + error.message)
      return
    }
    alert(`ONG "${nome}" atualizada com sucesso!`)
  } else {
    const { error } = await supabase
      .from('empresas')
      .insert([{ nome, email, cnpj, telefone, area }])
      .select()

    if (error) {
      console.error('Erro Supabase:', JSON.stringify(error))
      alert('Erro ao adicionar ONG: ' + error.message)
      return
    }
    alert(`ONG "${nome}" adicionada com sucesso!`)
  }

  editingOngId = null
  hideOngForm()
  await getOngsUpdateHtml()
  setEventListeners()
}

function showAddOngForm() {
  editingOngId = null
  document.querySelector('#ong-form-title').textContent = 'Adicionar'
  ;['#ong-nome','#ong-email','#ong-cnpj','#ong-telefone','#ong-area']
    .forEach(sel => { document.querySelector(sel).value = '' })
  document.querySelector('#add-edit-ong-form').style.display = 'block'
}

function hideOngForm() {
  document.querySelector('#add-edit-ong-form').style.display = 'none'
  editingOngId = null
}

// ===================== USUÁRIOS =====================

async function getUsersUpdateHtml() {
  const listaUsers = document.querySelector("#divCardsUsers")
  if (!listaUsers) return

  let { data, error } = await supabase.from('usuarios').select('*')
  if (error) { console.error(error); return }

  listaUsers.innerHTML = ''
  data.forEach(element => {
    const card = document.createElement("div")
    card.classList.add('card')
    card.innerHTML = `
      <h3>${element.nome}</h3>
      <p>Email: ${element.email}</p>
      <p>Celular: ${element.telefone}</p>
      <p>Tipo: ${element.tipo}</p>
      <div class="card-actions">
        <button class="btn-edit btn-secondary" data-edituserid="${element.id}">Editar</button>
        <button class="btn-delete btn-danger" data-userid="${element.id}">Excluir</button>
      </div>`
    listaUsers.appendChild(card)
  })
}

async function editUser(id) {
  const { data, error } = await supabase
    .from('usuarios').select('*').eq('id', id).single()

  if (error) { console.error(error); return }

  document.querySelector('#user-form-nome').value  = data.nome  || ''
  document.querySelector('#user-form-email').value = data.email || ''
  document.querySelector('#user-form-tipo').value  = data.tipo  || ''
  document.querySelector('#user-form-cpf').value   = data.cpf   || ''

  document.querySelector('#user-form-title').textContent = 'Editar'
  editingUserId = id
  document.querySelector('#add-edit-usuario-form').style.display = 'block'
}

async function saveUser() {
  const nome  = document.querySelector('#user-form-nome').value
  const email = document.querySelector('#user-form-email').value
  const tipo  = document.querySelector('#user-form-tipo').value
  const cpf   = document.querySelector('#user-form-cpf').value

  if (cpf && !validarCPF(cpf)) {
    alert('CPF inválido. Verifique os dígitos informados.')
    return
  }

  if (editingUserId) {
    const { error } = await supabase
      .from('usuarios')
      .update({ nome, email, tipo, cpf })
      .eq('id', editingUserId)

    if (error) {
      console.error('Erro Supabase:', JSON.stringify(error))
      alert('Erro ao atualizar usuário: ' + error.message)
      return
    }
    alert(`Usuário "${nome}" atualizado com sucesso!`)
  } else {
    const { error } = await supabase
      .from('usuarios')
      .insert([{ nome, email, tipo, cpf }])
      .select()

    if (error) {
      console.error('Erro Supabase:', JSON.stringify(error))
      alert('Erro ao adicionar usuário: ' + error.message)
      return
    }
    alert(`Usuário "${nome}" adicionado com sucesso!`)
  }

  editingUserId = null
  hideUserForm()
  await getUsersUpdateHtml()
  setEventListeners()
}

function showAddUserForm() {
  editingUserId = null
  document.querySelector('#user-form-title').textContent = 'Adicionar'
  ;['#user-form-nome','#user-form-email','#user-form-tipo','#user-form-cpf']
    .forEach(sel => { document.querySelector(sel).value = '' })
  document.querySelector('#add-edit-usuario-form').style.display = 'block'
}

function hideUserForm() {
  document.querySelector('#add-edit-usuario-form').style.display = 'none'
  editingUserId = null
}

// ===================== PRODUTOS =====================

function renderProdutoCard(element) {
  const card = document.createElement("div")
  card.classList.add('card')
  card.dataset.id = element.id
  card.innerHTML = `
    <h3>${element.nome}</h3>
    <p>Quantidade: ${element.quantidade}</p>
    <p>Validade: ${element.data_validade}</p>
    <div class="card-actions">
      <button class="btn-edit btn-secondary" data-editprodutoid="${element.id}">Editar</button>
      <button class="btn-delete btn-danger" data-produtoid="${element.id}">Excluir</button>
    </div>`
  return card
}

async function getProdutosUpdateHtml() {
  const listaProdutos = document.querySelector("#divCardsProdutos")
  if (!listaProdutos) return

  let { data, error } = await supabase.from('produtos').select('*')
  if (error) { console.error(error); return }

  listaProdutos.innerHTML = ''
  data.forEach(element => listaProdutos.appendChild(renderProdutoCard(element)))
}

function subscribeProdutosRealtime() {
  const listaProdutos = document.querySelector("#divCardsProdutos")
  if (!listaProdutos) return

  supabase
    .channel('produtos-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'produtos' }, (payload) => {
      listaProdutos.appendChild(renderProdutoCard(payload.new))
      setEventListeners()
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'produtos' }, (payload) => {
      const existing = listaProdutos.querySelector(`[data-id="${payload.new.id}"]`)
      if (existing) {
        existing.replaceWith(renderProdutoCard(payload.new))
      } else {
        listaProdutos.appendChild(renderProdutoCard(payload.new))
      }
      setEventListeners()
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'produtos' }, (payload) => {
      const existing = listaProdutos.querySelector(`[data-id="${payload.old.id}"]`)
      if (existing) existing.remove()
    })
    .subscribe()
}

async function editProduto(id) {
  const { data, error } = await supabase
    .from('produtos').select('*').eq('id', id).single()

  if (error) { console.error(error); return }

  document.querySelector('#produto-nome').value       = data.nome          || ''
  document.querySelector('#produto-quantidade').value = data.quantidade    || ''
  document.querySelector('#produto-validade').value   = data.data_validade || ''

  document.querySelector('#produto-form-title').textContent = 'Editar'
  editingProdutoId = id
  document.querySelector('#add-edit-produto-form').style.display = 'block'
}

async function saveProduto() {
  const nome          = document.querySelector('#produto-nome')?.value?.trim()
  const quantidade    = parseInt(document.querySelector('#produto-quantidade')?.value)
  const data_validade = document.querySelector('#produto-validade')?.value

  if (!nome || !quantidade || !data_validade) {
    alert('Preencha todos os campos obrigatórios')
    return
  }

  const normalizarNome = (str) =>
    str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

  if (editingProdutoId) {
    const { error } = await supabase
      .from('produtos')
      .update({ nome, quantidade, data_validade })
      .eq('id', editingProdutoId)

    if (error) { console.error('Erro update:', error); alert('Erro: ' + error.message); return }

    const cardEditado = document.querySelector(`#divCardsProdutos [data-id="${editingProdutoId}"]`)
    if (cardEditado) {
      cardEditado.replaceWith(renderProdutoCard({ id: editingProdutoId, nome, quantidade, data_validade }))
      setEventListeners()
    }

    alert(`Produto "${nome}" atualizado com sucesso!`)
  } else {
    const { data: todos, error: fetchError } = await supabase
      .from('produtos')
      .select('*')

    if (fetchError) { console.error('Erro ao buscar produtos:', fetchError); return }

    const nomeNorm = normalizarNome(nome)
    const match = todos?.find(p =>
      normalizarNome(p.nome) === nomeNorm &&
      p.data_validade === data_validade
    )

    if (match) {
      const novaQtd = match.quantidade + quantidade
      const { error } = await supabase
        .from('produtos')
        .update({ quantidade: novaQtd })
        .eq('id', match.id)

      if (error) { console.error('Erro ao acumular quantidade:', error); alert('Erro: ' + error.message); return }

      const cardExistente = document.querySelector(`#divCardsProdutos [data-id="${match.id}"]`)
      if (cardExistente) cardExistente.replaceWith(renderProdutoCard({ ...match, quantidade: novaQtd }))

      alert(`Quantidade de "${match.nome}" atualizada para ${novaQtd}!`)
    } else {
      const { data, error } = await supabase
        .from('produtos')
        .insert([{ nome, quantidade, data_validade }])
        .select()

      if (error) { console.error('Erro insert:', error); alert('Erro: ' + error.message); return }

      const listaProdutos = document.querySelector("#divCardsProdutos")
      if (listaProdutos && data && data[0]) {
        listaProdutos.appendChild(renderProdutoCard(data[0]))
        setEventListeners()
      }

      alert(`Produto "${nome}" cadastrado com sucesso!`)
    }
  }

  cancelEditProduto()
}

function showAddProdutoForm() {
  editingProdutoId = null
  document.querySelector('#produto-form-title').textContent = 'Adicionar'
  ;['#produto-nome','#produto-quantidade','#produto-validade']
    .forEach(sel => { document.querySelector(sel).value = '' })
  document.querySelector('#add-edit-produto-form').style.display = 'block'
}

function limparProdutoForm() {
  ;['#produto-nome','#produto-quantidade','#produto-validade']
    .forEach(sel => { document.querySelector(sel).value = '' })
}

function cancelEditProduto() {
  document.querySelector('#add-edit-produto-form').style.display = 'none'
  editingProdutoId = null
}

async function removeProduto(id) {
  if (!confirm("Deseja realmente remover esse produto?")) return

  const { data, error } = await supabase
    .from('produtos').delete().eq('id', id).select().single()

  if (error) { console.error(error); return }

  const card = document.querySelector(`#divCardsProdutos [data-id="${id}"]`)
  if (card) card.remove()

  alert(`Produto "${data.nome}" removido com sucesso`)
}

// ===================== AÇÕES =====================

let editingAcaoId = null

function renderAcaoCard(element) {
  const card = document.createElement("div")
  card.classList.add('card')
  card.dataset.id = element.id
  card.innerHTML = `
    <h3>Ação de ${element.data_realizada}</h3>
    <p>Local: ${element.local}</p>
    <p>Total de Produtos Entregues: ${element.total_produtos}</p>
    <div class="card-actions">
      <button class="btn-edit btn-secondary" data-editacaoid="${element.id}">Editar</button>
      <button class="btn-delete btn-danger" data-acaoid="${element.id}">Excluir</button>
    </div>`
  return card
}

async function getAcoesUpdateHtml() {
  const listaAcoes = document.querySelector("#divCardsAcoes")
  if (!listaAcoes) return

  let { data, error } = await supabase.from('acoes').select('*')
  if (error) { console.error(error); return }

  listaAcoes.innerHTML = ''
  data.forEach(element => listaAcoes.appendChild(renderAcaoCard(element)))
}

async function editAcao(id) {
  const { data, error } = await supabase
    .from('acoes').select('*').eq('id', id).single()

  if (error) { console.error(error); return }

  document.querySelector('#acao-data').value           = data.data_realizada  || ''
  document.querySelector('#acao-local').value          = data.local           || ''
  document.querySelector('#acao-total-produtos').value = data.total_produtos  || ''

  document.querySelector('#acao-form-title').textContent = 'Editar'
  editingAcaoId = id
}

async function saveAcao() {
  const data_realizada  = document.querySelector('#acao-data')?.value
  const local           = document.querySelector('#acao-local')?.value?.trim()
  const total_produtos  = parseInt(document.querySelector('#acao-total-produtos')?.value)

  if (!data_realizada || !local || !total_produtos) {
    alert('Preencha todos os campos obrigatórios')
    return
  }

  if (editingAcaoId) {
    const { error } = await supabase
      .from('acoes')
      .update({ data_realizada, local, total_produtos })
      .eq('id', editingAcaoId)

    if (error) { console.error('Erro update:', error); alert('Erro: ' + error.message); return }

    const cardEditado = document.querySelector(`#divCardsAcoes [data-id="${editingAcaoId}"]`)
    if (cardEditado) {
      cardEditado.replaceWith(renderAcaoCard({ id: editingAcaoId, data_realizada, local, total_produtos }))
      setEventListeners()
    }

    alert(`Ação atualizada com sucesso!`)
  } else {
    const { data, error } = await supabase
      .from('acoes')
      .insert([{ data_realizada, local, total_produtos }])
      .select()

    if (error) { console.error('Erro insert:', error); alert('Erro: ' + error.message); return }

    const listaAcoes = document.querySelector("#divCardsAcoes")
    if (listaAcoes && data && data[0]) {
      listaAcoes.appendChild(renderAcaoCard(data[0]))
      setEventListeners()
    }

    alert(`Ação cadastrada com sucesso!`)
  }

  limparAcaoForm()
}

function limparAcaoForm() {
  ;['#acao-data','#acao-local','#acao-total-produtos']
    .forEach(sel => { document.querySelector(sel).value = '' })
  document.querySelector('#acao-form-title').textContent = 'Cadastrar'
  editingAcaoId = null
}

async function removeAcao(id) {
  if (!confirm("Deseja realmente remover essa ação?")) return

  const { data, error } = await supabase
    .from('acoes').delete().eq('id', id).select().single()

  if (error) { console.error(error); return }

  const card = document.querySelector(`#divCardsAcoes [data-id="${id}"]`)
  if (card) card.remove()

  alert(`Ação removida com sucesso`)
}

// ===================== REMOÇÕES =====================

async function removeOng(id) {
  if (!confirm("Deseja realmente remover essa ONG?")) return

  const { data, error } = await supabase
    .from('empresas').delete().eq('id', id).select().single()

  if (error) { console.error(error); return }
  alert(`ONG "${data.nome}" removida com sucesso`)
  await getOngsUpdateHtml()
  setEventListeners()
}

async function removeUser(id) {
  if (!confirm("Deseja realmente remover esse usuário?")) return

  const { data, error } = await supabase
    .from('usuarios').delete().eq('id', id).select().single()

  if (error) { console.error(error); return }
  alert(`Usuário "${data.nome}" removido com sucesso`)
  await getUsersUpdateHtml()
  setEventListeners()
}

// ===================== LOGIN =====================

async function handleLogin(e) {
  e.preventDefault()
  const formData = Object.fromEntries(new FormData(e.target))
  if (formData.usuario !== 'teste') { alert("Usuário inválido"); return }
  if (formData.senha !== 'teste')   { alert("Senha inválida");   return }
  window.location.href = 'Sections/menu.html'
}

// ===================== CADASTRO PÚBLICO — EMPRESA =====================

async function handleCadastroEmpresa(e) {
  e.preventDefault()

  const nome     = document.querySelector('#company-nome')?.value?.trim()
  const email    = document.querySelector('#company-email')?.value?.trim()
  const cnpj     = document.querySelector('#company-cnpj')?.value?.trim()
  const telefone = document.querySelector('#company-celular')?.value?.trim()
  const area     = document.querySelector('#area')?.value?.trim()
  const senha    = document.querySelector('#company-senha')?.value
  const confirma = document.querySelector('#company-confirma-senha')?.value

  if (!nome || !email || !cnpj || !telefone || !area || !senha) {
    alert('Preencha todos os campos obrigatórios.')
    return
  }

  if (!validarCNPJ(cnpj)) {
    alert('CNPJ inválido. Verifique os dígitos informados.')
    return
  }

  if (!validarTelefone(telefone)) {
    alert('Telefone inválido. Use DDD + número (ex: 81999998888).')
    return
  }

  if (senha !== confirma) {
    alert('As senhas não coincidem!')
    return
  }

  const { error } = await supabase
    .from('empresas')
    .insert([{ nome, email, cnpj, telefone, area, senha }])
    .select()

  if (error) {
    console.error('Erro Supabase:', JSON.stringify(error))
    alert('Erro ao cadastrar empresa: ' + error.message)
    return
  }

  alert(`Empresa "${nome}" cadastrada com sucesso!`)
  document.querySelector('#formCadastroEmpresas').reset()
}

// ===================== CADASTRO PÚBLICO — USUÁRIO =====================

async function handleCadastroUsuario(e) {
  e.preventDefault()

  const nome      = document.querySelector('#user-nome')?.value?.trim()
  const sobrenome = document.querySelector('#user-sobrenome')?.value?.trim()
  const email     = document.querySelector('#user-email')?.value?.trim()
  const telefone  = document.querySelector('#user-celular')?.value?.trim()
  const tipo      = document.querySelector('#user-tipo')?.value?.trim()
  const cpf       = document.querySelector('#user-cpf')?.value?.trim()
  const senha     = document.querySelector('#user-senha')?.value
  const confirma  = document.querySelector('#user-confirma-senha')?.value

  if (!nome || !sobrenome || !email || !telefone || !tipo || !cpf || !senha) {
    alert('Preencha todos os campos obrigatórios.')
    return
  }

  if (!validarCPF(cpf)) {
    alert('CPF inválido. Verifique os dígitos informados.')
    return
  }

  if (!validarTelefone(telefone)) {
    alert('Telefone inválido. Use DDD + número (ex: 81999998888).')
    return
  }

  if (senha !== confirma) {
    alert('As senhas não coincidem!')
    return
  }

  const nomeCompleto = `${nome} ${sobrenome}`

  const { error } = await supabase
    .from('usuarios')
    .insert([{ nome: nomeCompleto, email, telefone, tipo, cpf, senha }])
    .select()

  if (error) {
    console.error('Erro Supabase:', JSON.stringify(error))
    alert('Erro ao cadastrar usuário: ' + error.message)
    return
  }

  alert(`Usuário "${nomeCompleto}" cadastrado com sucesso!`)
  document.querySelector('#formCadastroUsuarios').reset()
}

// ===================== EVENT LISTENERS =====================

function setEventListeners() {
  const listaOngs = document.querySelector("#divCardsOngs")
  if (listaOngs) {
    listaOngs.replaceWith(listaOngs.cloneNode(true))
    document.querySelector("#divCardsOngs").addEventListener("click", (e) => {
      const btnDelete = e.target.closest(".btn-delete[data-ongid]")
      const btnEdit   = e.target.closest(".btn-edit[data-editongid]")
      if (btnDelete) removeOng(btnDelete.dataset.ongid)
      if (btnEdit)   editOng(btnEdit.dataset.editongid)
    })
  }

  const listaUsers = document.querySelector("#divCardsUsers")
  if (listaUsers) {
    listaUsers.replaceWith(listaUsers.cloneNode(true))
    document.querySelector("#divCardsUsers").addEventListener("click", (e) => {
      const btnDelete = e.target.closest(".btn-delete[data-userid]")
      const btnEdit   = e.target.closest(".btn-edit[data-edituserid]")
      if (btnDelete) removeUser(btnDelete.dataset.userid)
      if (btnEdit)   editUser(btnEdit.dataset.edituserid)
    })
  }

  const listaProdutos = document.querySelector("#divCardsProdutos")
  if (listaProdutos) {
    listaProdutos.replaceWith(listaProdutos.cloneNode(true))
    document.querySelector("#divCardsProdutos").addEventListener("click", (e) => {
      const btnDelete = e.target.closest(".btn-delete[data-produtoid]")
      const btnEdit   = e.target.closest(".btn-edit[data-editprodutoid]")
      if (btnDelete) removeProduto(btnDelete.dataset.produtoid)
      if (btnEdit)   editProduto(btnEdit.dataset.editprodutoid)
    })
  }

  const listaAcoes = document.querySelector("#divCardsAcoes")
  if (listaAcoes) {
    listaAcoes.replaceWith(listaAcoes.cloneNode(true))
    document.querySelector("#divCardsAcoes").addEventListener("click", (e) => {
      const btnDelete = e.target.closest(".btn-delete[data-acaoid]")
      const btnEdit   = e.target.closest(".btn-edit[data-editacaoid]")
      if (btnDelete) removeAcao(btnDelete.dataset.acaoid)
      if (btnEdit)   editAcao(btnEdit.dataset.editacaoid)
    })
  }

  const formLogin = document.querySelector("#loginBox")
  if (formLogin) formLogin.addEventListener("submit", handleLogin)

  const formEmpresa = document.querySelector("#formCadastroEmpresas")
  if (formEmpresa) formEmpresa.addEventListener("submit", handleCadastroEmpresa)

  const formUsuario = document.querySelector("#formCadastroUsuarios")
  if (formUsuario) formUsuario.addEventListener("submit", handleCadastroUsuario)
}

// ===================== EXPOSIÇÃO GLOBAL =====================

Object.assign(window, {
  showAddOngForm,
  hideOngForm,
  saveOng,
  showAddUserForm,
  hideUserForm,
  saveUser,
  showAddProdutoForm,
  cancelEditProduto,
  saveProduto,
  limparProdutoForm,
  saveAcao,
  limparAcaoForm,
  editAcao,
  removeAcao,
})

// ===================== INIT =====================
await getOngsUpdateHtml()
await getUsersUpdateHtml()
await getProdutosUpdateHtml()
await getAcoesUpdateHtml()
subscribeProdutosRealtime()
setEventListeners()