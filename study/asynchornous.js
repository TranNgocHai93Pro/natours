// const fs = require('fs')

// const readFilePro = (path) => {
//   return new Promise((resolve, reject) => {
//     fs.readFile(path, 'utf-8', (err, data) => {
//       if (err) reject('Not Found File....')
//       resolve(data)
//     })
//   })
// }

// const writeFilePro = (path, data) => {
//   return new Promise((resolve, reject) => {
//     fs.writeFile(path, data, (err) => {
//       if (err) reject('Error write file...')
//       resolve(data)
//     })
//   })
// }

// const main = async () => {
//   try {
//     const path = await readFilePro('./dog.txt')
//     const data = await fetch(`https://dog.ceo/api/${path}/image/random`)
//     const { message } = await data.json()

//     await writeFilePro('./writeDog.txt', message)
//     console.log('Write File successful...')
//     return '2. task 2'
//   } catch (err) {
//     console.log(err)
//   }
// }

// ;(async () => {
//   console.log('1.task 1')
//   const x = await main()
//   console.log(x)
//   console.log('3.task 3')
// })()

const axios = require('axios')

const options = {
  method: 'GET',
  url: 'https://tasty.p.rapidapi.com/recipes/auto-complete',
  params: {
    prefix: 'chicken soup',
  },
  headers: {
    'X-RapidAPI-Key': 'SIGN-UP-FOR-KEY',
    'X-RapidAPI-Host': 'tasty.p.rapidapi.com',
  },
}

;(async () => {
  try {
    const response = await axios.request(options)
    console.log(response.data)
  } catch (error) {
    console.error(error.message)
  }
})()
