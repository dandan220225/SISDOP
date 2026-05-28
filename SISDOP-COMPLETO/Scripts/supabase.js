import { createClient } from "https://esm.sh/@supabase/supabase-js"
const supabase = createClient('https://kamjqsmvxqfogrsppfou.supabase.co', 'sb_publishable_lseolM209T2zqNOBzu0_PQ_byLzxnO9')

let editingOngId     = null
let editingUserId    = null
let editingProdutoId = null

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

// Realtime: escuta INSERT, UPDATE e DELETE na tabela produtos
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
  console.log('saveProduto chamado, editingProdutoId:', editingProdutoId)

  const nome          = document.querySelector('#produto-nome')?.value?.trim()
  const quantidade    = parseInt(document.querySelector('#produto-quantidade')?.value)
  const data_validade = document.querySelector('#produto-validade')?.value

  console.log('Dados:', { nome, quantidade, data_validade })

  if (!nome || !quantidade || !data_validade) {
    alert('Preencha todos os campos obrigatórios')
    return
  }

  if (editingProdutoId) {
    // Edição direta — apenas atualiza
    const { error } = await supabase
      .from('produtos')
      .update({ nome, quantidade, data_validade })
      .eq('id', editingProdutoId)

    if (error) { console.error('Erro update:', error); alert('Erro: ' + error.message); return }

    // Atualiza o card imediatamente no DOM
    const cardEditado = document.querySelector(`#divCardsProdutos [data-id="${editingProdutoId}"]`)
    if (cardEditado) {
      cardEditado.replaceWith(renderProdutoCard({ id: editingProdutoId, nome, quantidade, data_validade }))
      setEventListeners()
    }

    alert(`Produto "${nome}" atualizado com sucesso!`)
  } else {
    // Verifica se já existe produto com o mesmo nome (case-insensitive)
    const { data: existing, error: fetchError } = await supabase
      .from('produtos')
      .select('*')
      .ilike('nome', nome)

    if (fetchError) { console.error('Erro ao buscar produto:', fetchError); return }

    if (existing && existing.length > 0) {
      // Produto já existe — acumula quantidade
      const prod    = existing[0]
      const novaQtd = prod.quantidade + quantidade
      const { error } = await supabase
        .from('produtos')
        .update({ quantidade: novaQtd })
        .eq('id', prod.id)

      if (error) { console.error('Erro ao acumular quantidade:', error); alert('Erro: ' + error.message); return }

      // Atualiza o card existente imediatamente no DOM
      const cardExistente = document.querySelector(`#divCardsProdutos [data-id="${prod.id}"]`)
      if (cardExistente) cardExistente.replaceWith(renderProdutoCard({ ...prod, quantidade: novaQtd }))

      alert(`Quantidade de "${nome}" atualizada para ${novaQtd}!`)
    } else {
      // Produto novo — insere normalmente
      const { data, error } = await supabase
        .from('produtos')
        .insert([{ nome, quantidade, data_validade }])
        .select()

      console.log('Resultado insert:', data, error)
      if (error) { console.error('Erro insert:', error); alert('Erro: ' + error.message); return }

      // Adiciona o card imediatamente no DOM
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

  // Remove o card imediatamente do DOM sem depender do realtime
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

    // Atualiza o card imediatamente no DOM
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

    // Adiciona o card imediatamente no DOM
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
}

// ===================== EXPOSIÇÃO GLOBAL (imediata) =====================

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