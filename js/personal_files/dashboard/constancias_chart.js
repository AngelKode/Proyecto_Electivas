$(document).ready(() => {
    $(function () {
        //Creamos las configuraciones
        let config = {
            type: 'line',
            data: {
                labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio"],
                datasets: [{
                    label: "Constancias Recibidas",
                    data: [65, 59, 80, 81, 56, 55, 40],
                    borderColor: 'rgba(0, 188, 212, 0.75)',
                    backgroundColor: 'rgba(0, 188, 212, 0.75)',
                    pointBorderColor: 'rgba(0, 188, 212, 0)',
                    pointBackgroundColor: 'rgba(0, 188, 212, 0.9)',
                    pointBorderWidth: 1,
                    fill : false,
                    tension : 0.01
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio : true,
                legend: false,
                legend : {}
            }
        }

        //Inicializamos la grafica
        new Chart(document.getElementById("constancias_chart").getContext("2d"), config);
    });
})