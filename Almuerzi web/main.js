const API_URL = 'https://almuerzi-api-joelit0.vercel.app/api/'
let mealsState = []
let user = {}
let path = 'login' //login, register, orders

const stringToHTML = (s) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(s, 'text/html')

  return doc.body.firstChild
}

const renderItem = (item) => {
  const element = stringToHTML(`<li data-id="${order._id}">${item.name}</li>`)

  element.addEventListener('click', () => {
    const mealsList = document.getElementById('meals-list')
    
    Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))
    element.classList.add('selected')
    const mealsIdInput = document.getElementById('meals-id')
    mealsIdInput.value = item._id
  })

  return element
}

const renderOrder = (order, meals) => {
  const meal = meals.find(meal => meal._id === order.meal_id)
  const element = stringToHTML(`<li data-id="${order._id}">${meal.name} - ${order.user_id}</li>`)

  return element
}

const initializeForm = () => {
  const orderForm = document.getElementById('order')
  orderForm.onsubmit = (e) => {
    e.preventDefault()
    const submit = document.getElementById('submit')
    submit.setAttribute('disabled', true)
    const mealId = document.getElementById('meals-id')
    const mealIdValue = mealId.value

    if (!mealIdValue) {
      alert('You must select some meal')
      submit.removeAttribute('disabled')
      return
    }

    const order = {
      meal_id: mealIdValue,
      user_id: user._id
    }

    const token = localStorage.getItem('token')

    fetch(API_URL + 'orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: token
      },
      body: JSON.stringify(order),
      
    }).then(x => x.json())
      .then(response => {
        const renderedOrder = renderOrders(response, mealsState)
        const ordersList = document.getElementById('orders-list')
        ordersList.appendChild(renderedOrder)
        submit.removeAttribute('disabled')
      })
  }
}

const intializeData = () => {
  fetch(API_URL + 'meals')
  .then(response => response.json())
  .then(data => {
    mealsState = data
    const mealsList = document.getElementById('meals-list')
    const submit = document.getElementById('submit')
    const listItems = data.map(renderItem)
    mealsList.removeChild(mealsList.firstElementChild)
    listItems.forEach(element => mealsList.appendChild(element))
    submit.removeAttribute('disabled')
    fetch(API_URL + 'orders')
      .then(response => response.json())
      .then(ordersData => {
        const ordersList = document.getElementById('orders-list')
        const listOrders = ordersData.map(orderData => renderOrder(orderData, data))
        ordersList.removeChild(ordersList.firstElementChild)
        listOrders.forEach(element => ordersList.appendChild(element))
      })
  })
}
const renderApp = () => {
  const token = localStorage.getItem('token')
  if (token) {
    user = JSON.parse(localStorage.getItem('user'))
    return renderOrders()
  }
  renderLogin()
}

const renderOrders = () => {
  const ordersView = document.getElementById('orders-view')
  document.getElementById('app').innerHTML = ordersView.innerHTML

  initializeForm()
  intializeData()
}

const renderLogin = () => {
  const loginTemplate = document.getElementById('login-view')
  document.getElementById('app').innerHTML = loginTemplate.innerHTML

  const loginForm = document.getElementById('login-form')
  loginForm.onsubmit = (e)  => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    fetch(API_URL + 'auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    }).then(x => x.json())
    .then(response => {
      localStorage.setItem('token', response.token)
      path = 'orders'
      return response.token
    })
    .then(token => {
      fetch(API_URL + 'auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: token
        }
      })
      .then(x => x.json())
      .then(fetchedUser =>  {
        localStorage.setItem('user', JSON.stringify(fetchedUser))
        user = fetchedUser
        renderOrders()
      })
    })
  }
}

window.onload = () => {
  renderApp()
}
