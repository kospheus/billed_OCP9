/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {

  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {

      // Je me connecte en tant qu'employé

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Je vérifie que la class active-icon est assignée à l'icone window

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy()

    })

    test("Then bills should be ordered from earliest to latest", () => {

      //je vérifie l'ordre de tri

      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1) 
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })



    test("Bills should appear on click on the eye icon", () => {

      // Je récupère l'icone et je clique dessus
      
      const bills = new Bills({ document, onNavigate, store:null, localStorage  })
      const iconEye = screen.getAllByTestId("icon-eye");
      const handleClickIconEye = jest.fn((icon) => bills.handleClickIconEye(icon))

      // Je récupère la modale et je vérifie qu'elle est ouverte

      const modal = document.getElementById("modaleFile")
      $.fn.modal = jest.fn(() => modal.classList.add("show"))
      iconEye.forEach((icon) => {
        icon.addEventListener("click", handleClickIconEye(icon))
        userEvent.click(icon)
        expect(handleClickIconEye).toHaveBeenCalled()
      })
      expect(modal.classList.contains("show")).toBeTruthy()
    })
  })
})



describe("When I click on 'Nouvelle note de frais'", () => {

  // Vérifie si le formulaire de création de bills apparait

  test("Then i can create a NewBill with the form", async () => {

    // Je me connecte en tant qu'employé

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
    window.localStorage.setItem("user", JSON.stringify({
      type: "Employee"
    }))

    // Je vais sur a page bill

    const initBills = new Bills({
      document, onNavigate, store: null, localStorage: window.localStorage
    })
    document.body.innerHTML = BillsUI({ data: bills })

    // Je récupère le bouton note de frais et je lique dessus

    const handleClickNewBill = jest.fn(() => initBills.handleClickNewBill ())
    const btnNoteFrais = screen.getByTestId("btn-new-bill")
    btnNoteFrais.addEventListener("click", handleClickNewBill)
    userEvent.click(btnNoteFrais)

    // Je vérifie que ca a été cliqué et que j'ai changé de page

    expect(handleClickNewBill).toHaveBeenCalled()
    await waitFor(() => screen.getByTestId("form-new-bill"))
    expect(screen.getByTestId("form-new-bill")).toBeTruthy()
  })
})

// Intégration GET

describe("When an error occurs on API", () => {

  //Je définis le fait d'être employé et que je me trouve sur la bonne page

  beforeEach(() => {
    jest.spyOn(mockStore, "bills")
    Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
    )
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
  })

  // Je vérifie si ca fait une erreur 404

  test("Then fetches bills from an API and fails with 404 message error", async () => {

    // Je crée une fausse erreur 404

    mockStore.bills.mockImplementationOnce(() => {
      return {
        list : () =>  {
          return Promise.reject(new Error("Erreur 404"))
        }
      }
    })

    // Je vérifie que l'erreur 404 ets présente

    const html = BillsUI({ error: "Erreur 404" })
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy()
  })

  //Je vérifie si ca fait une erreur 500

  test("Then fetches messages from an API and fails with 500 message error", async () => {

    // Je crée une fausse erreur 500

    mockStore.bills.mockImplementationOnce(() => {
      return {
        list : () =>  {
          return Promise.reject(new Error("Erreur 500"))
        }
      }
    })

    // Je vérifie que l'erreur 404 ets présente

    const html = BillsUI({ error: "Erreur 500" })
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
  })
})


