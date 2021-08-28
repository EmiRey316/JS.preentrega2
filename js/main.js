//
//              SISTEMA DE SIMULACIÓN DE PRÉSTAMOS
//
//  2 tipo de préstamos habilitados:
//  
//  - Préstamo Simple: Préstamo en que el capital solicitado se divide en partes iguales en todas las cuotas.
//                      Además se paga el interés correspondiente a cada mensualidad.
//                      En las primeras cuotas se paga más y en las útimas menos.
//
//  - Loan Americano: Préstamo en que el capital solicitado se paga en su totalidad en la últimacuota y en el
//                         resto solo se pagan intereses, por ello la última cuota es muy superior a las demás.
//



/**************************************************************
*                          CLASES
**************************************************************/

//Creo la clase global Loan, que contiene los parámetros y métodos generales de todos los tipos de préstamos.
class lending {
    constructor (id, productType, amount, term) {
        this.id = id;
        this.productType = productType;
        this.amount = amount;
        this.term = term;
        this.quotas = [];
        this.totalPayment = 0;
    }


    interest(capital, anualRate) {
        return (capital * (anualRate / 12)) / 100;
    }

    //Método para guardar las cuotas en el array de colección.
    saveFee(feeValue) {
        this.quotas.push(feeValue);
    }
}


//Creo la clase simpleLending como subclase de Loan.
class simpleLending extends lending {

    loadFees() {
        //Defino la variable balance, como el saldo de capital que falta pagar.
        let balance = this.amount;

        let monthlyPayment = this.amount / this.term;

        //Ciclo que calcula y carga en la colección el valor de cada cuota. Además va sumando el totalPayment.
        for (let i = 1; i <= this.term; i++) {
            let feeInterest = this.interest(balance, anualRateSimple);
            let feeValue = monthlyPayment + feeInterest;
            this.totalPayment = this.totalPayment + feeValue;

            this.saveFee(feeValue);
            
            //Actualizo el saldo.
            balance = balance - monthlyPayment;
        }
    }
}


//Creo la clase LoanAmericano como subclase de Loan.
class americanLending extends lending {

    loadFees() {
        let monthlyInterest = this.interest(this.amount, anualRateAmerican);

        //Las primeras cuotas únicamente tienen interés, las cargo con este ciclo.
        for (let i = 1; i < this.term; i++) {
            this.saveFee(monthlyInterest);
        }

        //Calculo la cuota final y la guardo.
        let finalFee = monthlyInterest + this.amount;
        this.saveFee(finalFee);

        //En este caso, el pago total es el monto solicitado sumado al interes pagado en todas las cuotas. Lo cálculo y transformo.
        this.totalPayment = this.amount + (monthlyInterest * this.term);
    }
}



/**************************************************************
*                    CONSTANTES Y VARIABLES
**************************************************************/

const anualRateSimple = 40;
const anualRateAmerican = 50;

//Creo la variable que será utilizada para crear el objeto préstamo según el tipo y el array que los contendrá.
let loan;
let loanCollection = [];

//Último ID creado, 1 por defecto si es el primer préstamo.
let lastID = 0;

let simulatorForm = document.getElementById("simulatorForm");



/**************************************************************
*                          FUNCIONES
**************************************************************/

//Función para transformar un valor númerico en formato de moneda.
const valueToCurrency = (value) => {
    return new Intl.NumberFormat('es-UY', {style: 'currency',currency: 'UYU', minimumFractionDigits: 2}).format(value);
}



//Función para cargar y guardar en storage los datos de un préstamo.
const saveLoan = (e) => {
    e.preventDefault();

    let productType = document.getElementById("productType").value;
    let amount = Number(document.getElementById("amount").value);
    let term = Number(document.getElementById("term").value);

    //Si ya existe un historial de préstamos en el storage, traigo el ID del último elemento. Con esto me aseguro de no repetir ID.
    if ((JSON.parse(localStorage.getItem("loans")) == null) || (JSON.parse(localStorage.getItem("loans")).length == 0)) {
        lastID = 0;
    } else {
        loanCollection = JSON.parse(localStorage.getItem("loans"));
        lastID = loanCollection[loanCollection.length - 1].id;
    }
    
    //Primero creo el objeto con la clase correspondiente al tipo de producto.
    switch (productType) {
        case "simple":
            loan = new simpleLending(lastID + 1, "Simple", amount, term);
            break;
    
        default:
            loan = new americanLending(lastID + 1, "Americano", amount, term);
    }

    //Genero las cuotas y el pago total del préstamo.
    loan.loadFees();

    loanCollection.push(loan);
    localStorage.setItem("loans", JSON.stringify(loanCollection));
}



//Muestro el resultado de la solicitud de préstamo.
const showResults = () => {
    let showProductType = document.getElementById("showProductType");
    let showAmount = document.getElementById("showAmount");
    let showTerm = document.getElementById("showTerm");
    let showTEA = document.getElementById("showTEA");
    let showFee = document.getElementById("showFee");
    let showTotalPayment = document.getElementById("showTotalPayment");

    //Datos mostrados según tipo de préstamo.
    switch (loan.productType) {
        case "Simple":
            showProductType.textContent = "Simple";
            showTEA.textContent = `${anualRateSimple} %`;
            showFee.textContent = valueToCurrency(loan.quotas[0]);
            break;
    
        default:
            showProductType.textContent = "Americano";
            showTEA.textContent = `${anualRateAmerican} %`;
            showFee.textContent = valueToCurrency(loan.quotas[0]);
    }

    showAmount.textContent = valueToCurrency(loan.amount);
    showTerm.textContent = `${loan.term} cuotas`;
    showTotalPayment.textContent = valueToCurrency(loan.totalPayment);
}



//Creación de tabla con el historial de préstamos guardados en storage.
const loansTableCreate = () => {

    loanCollection = JSON.parse(localStorage.getItem("loans"));
    let loansTableBody = document.getElementById("loansTableBody");
    
    //Creando cada fila de la tabla por cada loan del historial.
    loanCollection.forEach(e => {
            let tableRow = document.createElement("tr");

            let rowth = document.createElement("th");
            rowth.setAttribute("scope", "row");
            rowth.textContent = `${e.id}`;
            tableRow.appendChild(rowth);

            let typetd = document.createElement("td");
            typetd.textContent = `${e.productType}`;
            tableRow.appendChild(typetd);

            let amounttd = document.createElement("td");
            amounttd.textContent = `${valueToCurrency(e.amount)}`;
            tableRow.appendChild(amounttd);

            let termtd = document.createElement("td");
            termtd.textContent = `${e.term}`;
            tableRow.appendChild(termtd);

            let actionstd = document.createElement("td")
            tableRow.appendChild(actionstd)

            //Botón para ver más detalles del préstamo, que se abrirán en un modal.
            let viewButton = document.createElement("button");
            viewButton.setAttribute("data-bs-toggle", `modal`);
            viewButton.setAttribute("data-bs-target", `#amortizationModal`);
            viewButton.setAttribute("onclick", `viewLoan(${e.id})`);
            let viewIcon = document.createElement("img");
            viewIcon.setAttribute("src", "multimedia/view.png");
            viewButton.appendChild(viewIcon);
            actionstd.appendChild(viewButton);
            
            //Botón para borrar el préstamo.
            let deleteButton = document.createElement("button");
            deleteButton.setAttribute("id", `${e.id}`);
            deleteButton.setAttribute("onclick", `deleteLoan(${e.id})`);
            let deleteIcon = document.createElement("img");
            deleteIcon.setAttribute("src", "multimedia/delete.png");
            deleteButton.appendChild(deleteIcon);
            actionstd.appendChild(deleteButton);


            loansTableBody.appendChild(tableRow);
        })
}



//Función para borrar del historial un préstamo concreto.
const deleteLoan = (id) => {
    loanCollection = JSON.parse(localStorage.getItem("loans"));
    let actualizedLoanCollection = loanCollection.filter(e => e.id != id);
    localStorage.setItem("loans", JSON.stringify(actualizedLoanCollection));
    location.reload();
}



//Función para ver más detalles de un préstamo concreto. Se mostrará en un modal.
const viewLoan = (id) => {
    loanCollection = JSON.parse(localStorage.getItem("loans"));
    let loanToview = loanCollection.find(e => e.id == id);
    console.log(loanToview);
    let amortizationTableBody = document.getElementById("amortizationTableBody");
    //Primero borro la información que pudiese haber quedado.
    amortizationTableBody.textContent = "";

    let amortizationFees = loanToview.quotas;
    console.log(amortizationFees);

    //Creo la tabla que mostrará las cuotas del préstamo.
    amortizationFees.forEach(e => {
        let feeRow = document.createElement("tr");

        console.log(e);
        let feeth = document.createElement("th");
        feeth.setAttribute("scope", "row");
        feeth.textContent = `${amortizationFees.indexOf(e) + 1}`;
        feeRow.appendChild(feeth);

        let feeValuetd = document.createElement("td");
        feeValuetd.textContent = `${valueToCurrency(e)}`;
        feeRow.appendChild(feeValuetd);

        amortizationTableBody.appendChild(feeRow);
    })
}



/**************************************************************
*                          EJECUCIÓN
**************************************************************/

//Verifico si estoy en la página del simulador o en otra y ejecuto los eventos correspondientes. Por ahora son solo 2.
if (document.getElementById("simulatorPage") != null) {
    simulatorForm.addEventListener("submit", saveLoan);
    simulatorForm.addEventListener("submit", showResults);
} else {
    loansTableCreate();
}