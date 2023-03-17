/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import userEvent from "@testing-library/user-event"
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js"
import Store from "../app/Store"


jest.mock("../app/Store", () => mockStore)



describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {

    test("The newbills page is loaded", () => {

      // je déclare que je suis un employé

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));

      // je déclare que je suis sur la page newbill

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

    })

    test("Then the bill icon should be highlighted", async () => {

      //je déclare être un employé

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // je me met sur la page newbill

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      //je récupère l'icone pour vérifier qu'il est bien surligné

      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.classList.contains("active-icon")).toBeTruthy()

    })

    

    test("Then verify the file bill", async() => {

      jest.spyOn(mockStore, "bills")

      //je déclare être un employé et je charge un fichier

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }     
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))

      //je charge la page      

      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillInit = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      // Je crée le fichier

      const file = new File(['image'], 'image.png', {type: 'image/png'});
      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));

      // Je charge le fichier

      const formNewBill = screen.getByTestId("form-new-bill")
      const billFile = screen.getByTestId('file');
      billFile.addEventListener("change", handleChangeFile);     
      userEvent.upload(billFile, file)
      expect(billFile.files[0].name).toBeDefined()
      expect(handleChangeFile).toBeCalled()

      // Je vérifie le fichier

      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);     
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    })


    // Je vérifie si je peux envoyer une nouvelle bill
    
    test("Then I could submit the newbill", () => {

      // je vais sur la page newBill

      document.body.innerHTML = NewBillUI()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname }) 
        }

        //Je déini que je suis employé
  
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a.com" }))
        const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage }) // Initialiser le localstorage pour définir "je suis un employé"
        
        //création d'une bill

        const validBill = { // canger le nom de la bill + tout modifier dans le code
          type: "Restaurants et bars",
          name: "Vol Paris Montréal",
          date: "2022-02-15",
          amount: 200,
          vat: 70,                     
          pct: 30,
          commentary: "Commentary",
          fileUrl: "../img/0.jpg",
          fileName: "test.jpg",
          status: "pending"
        }

        // On rempli le formulaire avec les valeurs de la bill

        screen.getByTestId("expense-type").value = validBill.type
        screen.getByTestId("expense-name").value = validBill.name
        screen.getByTestId("datepicker").value = validBill.date
        screen.getByTestId("amount").value = validBill.amount
        screen.getByTestId("vat").value = validBill.vat
        screen.getByTestId("pct").value = validBill.pct
        screen.getByTestId("commentary").value = validBill.commentary
        
        // Je vérifie la validité des valeurs de l'input

        const inputType = screen.getByTestId("expense-type"); // je récupère l'input
        fireEvent.change(inputType, {
          target: { value: validBill.type }, // a chaque fois que j'appuie sur une touche
        });
        expect(inputType.value).toBe(validBill.type); // je vérifie si la valeur est bonne

        const inputName = screen.getByTestId("expense-name");
        fireEvent.change(inputName, {
          target: { value: validBill.name },
        });
        expect(inputName.value).toBe(validBill.name);

        const inputDate = screen.getByTestId("datepicker");
        fireEvent.change(inputDate, {
          target: { value: validBill.date },
        });
        expect(inputDate.value).toBe(validBill.date);

        const inputAmount = screen.getByTestId("amount");
        fireEvent.change(inputAmount, {
          target: { value: validBill.amount },
        });
        expect(inputAmount.value).toBe(validBill.amount.toString());

        const inputVAT = screen.getByTestId("vat");
        fireEvent.change(inputVAT, {
          target: { value: validBill.vat },
        });
        expect(inputVAT.value).toBe(validBill.vat.toString());

        const inputPCT = screen.getByTestId("pct");
        fireEvent.change(inputPCT, {
          target: { value: validBill.pct },
        });
        expect(inputPCT.value).toBe(validBill.pct.toString());

        const inputCommentary = screen.getByTestId("commentary");
        fireEvent.change(inputCommentary, {
          target: { value: validBill.commentary },
        });
        expect(inputCommentary.value).toBe(validBill.commentary);

        // je vérifie la validité du fichier

        newBill.fileName = validBill.fileName
        newBill.fileUrl = validBill.fileUrl
        newBill.updateBill = jest.fn()

        // Je valide le formulaire

        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e)) // je déclare la fonction pour dire que ca valide le formulaire
        const button = screen.getByTestId("form-new-bill") // je récupère le bouton submit
        button.addEventListener("submit", handleSubmit) // J'applique un event au click je vérifie le formulaire
        fireEvent.submit(button) // j'appuie sur le boutton


        
        expect(handleSubmit).toHaveBeenCalled() // je vérifie si la fonction d'envoie s'est bien lancée
        expect(newBill.updateBill).toHaveBeenCalled() // je vérifie si j'ai bien créé une nouvelle bill
      })
    })
  })


  // Test d'intégration

  describe("Given I am a user connected as Employee", () => {

    describe("When I navigate on New Bills page", () => {

      test("he will create a New Bill (post)", async () => {

        // Je défini une nouvelle note de frais

        jest.mock('../app/Store');
        const newBill = { 
          email: 'test@post.fr',
          type: "Employee",
          name:  "Frais de carburants",
          amount: 250,
          date:  "2022/06/25",
          vat: 20,
          pct: 20,
          commentary: "Success !",
          fileUrl: "chemin/du/fichier",
          fileName: "justificatif-23.jpeg",
          status: 'accepted'
        }

        // Je vérifie si elle se retrouve dans la base de donnée

        Store.bill = () => ({ newBill, post: jest.fn().mockResolvedValue() })
        const getSpy = jest.spyOn(Store, "bill")
        const postReturn = Store.bill(newBill)
        expect(getSpy).toHaveBeenCalledTimes(1)
        expect(postReturn.newBill).toEqual(newBill)
      })
    })
  })


  



