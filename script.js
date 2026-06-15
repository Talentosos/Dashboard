entregas.forEach(e => {
    e.diasAtraso =
        Math.max(
            0,
            e.diasReais - e.prazoDias
        );
});

let graficoRegiao;
let graficoTransportadora;

const selectRegiao =
document.getElementById("filtroRegiao");

const selectTransportadora =
document.getElementById("filtroTransportadora");

function carregarFiltros(){

    [...new Set(
        entregas.map(e=>e.regiao)
    )].forEach(r=>{

        selectRegiao.innerHTML +=
        `<option>${r}</option>`;
    });

    [...new Set(
        entregas.map(
            e=>e.transportadora
        )
    )].forEach(t=>{

        selectTransportadora.innerHTML +=
        `<option>${t}</option>`;
    });

}

function atualizarDashboard(){

    let dados = entregas;

    if(selectRegiao.value){

        dados =
        dados.filter(
            e=>e.regiao ===
            selectRegiao.value
        );
    }

    if(selectTransportadora.value){

        dados =
        dados.filter(
            e=>e.transportadora ===
            selectTransportadora.value
        );
    }

    const atrasadas =
    dados.filter(
        e=>e.diasAtraso > 0
    );

    document.getElementById(
        "totalEntregas"
    ).innerText =
    dados.length;

    document.getElementById(
        "totalAtrasadas"
    ).innerText =
    atrasadas.length;

    document.getElementById(
        "percentual"
    ).innerText =
    dados.length === 0
        ? "0%"
        : (
            atrasadas.length
            / dados.length
            *100
          ).toFixed(1)+"%";

    document.getElementById(
        "maiorAtraso"
    ).innerText =
    atrasadas.length === 0
    ? "0 dias"
    : Math.max(
        ...atrasadas.map(
            e=>e.diasAtraso
        )
      ) + " dias";

    preencherTabela(atrasadas);

    gerarGraficos(atrasadas);

    gerarAlertas(atrasadas);
}

function preencherTabela(lista){

    const tabela =
    document.getElementById(
        "tabelaAtrasos"
    );

    tabela.innerHTML = "";

    lista
    .sort(
        (a,b)=>
        b.diasAtraso -
        a.diasAtraso
    )
    .forEach(e=>{

        let prioridade =
        "Média";

        let classe =
        "medio";

        if(e.diasAtraso >= 6){

            prioridade =
            "Crítica";

            classe =
            "critico";
        }
        else if(
            e.diasAtraso >= 3
        ){

            prioridade =
            "Alta";

            classe =
            "alto";
        }

        tabela.innerHTML += `
        <tr class="${classe}">
            <td>${e.id}</td>
            <td>${e.transportadora}</td>
            <td>${e.regiao}</td>
            <td>${e.diasAtraso}</td>
            <td>${prioridade}</td>
        </tr>
        `;
    });

}

function gerarGraficos(lista){

    const regioes = {};
    const transportadoras = {};

    lista.forEach(e=>{

        regioes[e.regiao] =
        (regioes[e.regiao] || 0)
        +1;

        transportadoras[
            e.transportadora
        ] =
        (
            transportadoras[
                e.transportadora
            ] || 0
        ) +1;
    });

    if(graficoRegiao)
        graficoRegiao.destroy();

    if(graficoTransportadora)
        graficoTransportadora.destroy();

    graficoRegiao =
    new Chart(
        document.getElementById(
            "graficoRegiao"
        ),
        {
            type:"bar",
            data:{
                labels:
                Object.keys(regioes),
                datasets:[
                    {
                        label:
                        "Atrasos",
                        data:
                        Object.values(
                            regioes
                        ),
                        backgroundColor:
                        "#2563eb"
                    }
                ]
            }
        }
    );

    graficoTransportadora =
    new Chart(
        document.getElementById(
            "graficoTransportadora"
        ),
        {
            type:"pie",
            data:{
                labels:
                Object.keys(
                    transportadoras
                ),
                datasets:[
                    {
                        data:
                        Object.values(
                            transportadoras
                        ),
                        backgroundColor:[
                            "#1d4ed8",
                            "#3b82f6",
                            "#60a5fa"
                        ]
                    }
                ]
            }
        }
    );
}

function gerarAlertas(lista){

    const caixa =
    document.getElementById(
        "caixaAlertas"
    );

    caixa.innerHTML = "";

    if(lista.length === 0){

        caixa.innerHTML =
        "<div class='alerta'>Nenhum atraso encontrado.</div>";

        return;
    }

    const maior =
    lista.sort(
        (a,b)=>
        b.diasAtraso -
        a.diasAtraso
    )[0];

    caixa.innerHTML += `
    <div class="alerta">
         Entrega ${maior.id}
        possui o maior atraso:
        ${maior.diasAtraso} dias.
    </div>
    `;

    const transportadoras = {};

    lista.forEach(e=>{

        transportadoras[
            e.transportadora
        ] =
        (
            transportadoras[
                e.transportadora
            ] || 0
        ) +1;
    });

    const pior =
    Object.entries(
        transportadoras
    )
    .sort(
        (a,b)=>b[1]-a[1]
    )[0];

    caixa.innerHTML += `
    <div class="alerta">
         ${pior[0]}
        é a transportadora
        com maior número de
        atrasos.
    </div>
    `;
}

selectRegiao.addEventListener(
    "change",
    atualizarDashboard
);

selectTransportadora
.addEventListener(
    "change",
    atualizarDashboard
);

carregarFiltros();
atualizarDashboard();