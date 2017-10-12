//Controlador de orçamento
var controladorOrcamento = (function() {
    var Despesa = function(id, descricao, valor) {
        this.id = id;
        this.descricao = descricao;
        this.valor = valor;
        this.porcentagem = -1;
    };

    Despesa.prototype.calcPorcentagem = function(totalReceita) {
        if(totalReceita > 0) {
            this.porcentagem = ((this.valor / totalReceita)* 100).toFixed(1) ;
        }else {
            this.porcentagem = -1;
        }
    };

    Despesa.prototype.dadosPorcentagem = function() {
        return this.porcentagem;
    };

    var Receita = function(id, descricao, valor) {
        this.id = id;
        this.descricao = descricao;
        this.valor = valor;
    };
    var  calculoTotal = function(tipo) {
        var soma = 0;
        dados.itens[tipo].forEach(function(current) {
            soma  += current.valor;
        });
        dados.total[tipo] = soma;
    };

    //Estrutura para receber os dados
    var dados = {
        itens: {
            desp: [],
            rec: []
        },
        total: {
            desp: 0,
            rec: 0
        },
        orcamento: 0,
        porcentagem:  -1
    };

    return {
        addItem: function(tipo, des, val) {
            var novoItem, ID;
            if (dados.itens[tipo].length > 0) {
                ID = dados.itens[tipo][dados.itens[tipo].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if(tipo === 'desp') {
                novoItem = new Despesa(ID, des, val);
            } else if (tipo === 'rec') {
                novoItem = new Receita(ID, des, val);
            }
            dados.itens[tipo].push(novoItem);
            return novoItem;
        },

        deletaItem: function(tipo, id) {
            var index, ids;
            
             ids = dados.itens[tipo].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);

            if(index !== '') {
                dados.itens[tipo].splice(index,1);
                console.log(ids);
            }
        },

        calculoOrcamento: function() {

            //Calculo do total de receitas e despesas
            calculoTotal('rec');
            calculoTotal('desp');

            //Calculo do orçamento do dia: Receitas - despesas
            dados.orcamento =  dados.total.rec - dados.total.desp;

            //Calculo da porcentagem da receita que foi gasta no item
            if(dados.total.rec > 0) {
                dados.porcentagem = ((dados.total.desp / dados.total.rec) * 100).toFixed(1) ;
            } else  {
                dados.porcentagem = -1;
            }
        },

        calculoPorcentagem() {
            dados.itens.desp.forEach(function(current) {
                current.calcPorcentagem(dados.total.rec);
            });
        },

        dadosPorcentagem: function() {
            var mapPorcentagens = dados.itens.desp.map(function(current) {
                return current.dadosPorcentagem();
            });
            return mapPorcentagens;
        },

        dadosOrcamento: function() {

            return {
                orcamento: dados.orcamento,
                totalReceita: dados.total.rec,
                totalDespesa: dados.total.desp,
                porcentagem: dados.porcentagem
            } 
        },
    };
})();

//Controlador da interface
var controladorInterface = (function(){

    var selectorStr = {
        addTipo: '.add__tipo',
        addDescricao: '.add__descricao',
        addValor: '.add__valor',
        addBtn: '.add__btn',
        containerReceita: '.receita__lista',
        containerDespesa: '.despesa__lista',
        orcamentoTotal: '.orcamento__valor',
        orcamentoReceita: '.orcamento__receita--valor',
        orcamentoDespesa: '.orcamento__despesa--valor',
        orcamentoPorcentagem: '.orcamento__despesa--porcentagem',
        container: '.container',
        porcentagemDespesa: '.item__porcentagem',
        addMesAtual: '.orcamento__titulo--mes',
        addDiv: '.add',
        addIcon: '.btn'
    };

    //Formatar Valores
    var formatNumero = function(num, tipo) {
        var splitNumero, inteiro, decimal, tipo;
        num = Math.abs(num);
        num = num.toFixed(2);

        splitNumero = num.split('.')

        // Int é a primeiro elemento do array "0"
        inteiro = splitNumero[0];
        if(inteiro.length >3) {
            inteiro = inteiro.substr(0, inteiro.length -3) + '.' + inteiro.substr(inteiro.length - 3,  inteiro.length);
        }

        decimal = splitNumero[1];

        return  (tipo === 'desp'  ? '-' : '+') + ' ' + inteiro+',' + decimal;
    };

    var listaForEach = function(lista, callback) {
        for (var i  = 0; i < lista.length; i++) {
            callback(lista[i], i);
        }
    };

    // Função para pegar dados do input
    return {
        dadosInput: function() {
            return {
                tipo: document.querySelector(selectorStr.addTipo).value,
                descricao: document.querySelector(selectorStr.addDescricao).value,
                valor: parseFloat(document.querySelector(selectorStr.addValor).value),
            };
        },

        //Funcção para adicionar novos intens no html
        addItemLista: function(obj, tipo) {
            var html, replaceHtml;
            if (tipo === 'rec') {
                element =selectorStr.containerReceita;

                html = '<div class="item clearfix" id="rec-%id%"><div class="item__descricao">%descricao%</div><div class="right clearfix"><div class="item__valor">%valor%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-trash"></i></button></div></div></div>';
            } else if (tipo === 'desp') {
                element =selectorStr.containerDespesa;

                html = '<div class="item clearfix" id="desp-%id%"><div class="item__descricao">%descricao%</div><div class="right clearfix"><div class="item__valor">%valor%</div><div class="item__porcentagem"></div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-trash"></i></button></div></div></div>';
            }

            // Substituir placeholder
            replaceHtml = html.replace('%id%', obj.id);
            replaceHtml = replaceHtml.replace('%descricao%', obj.descricao);
            replaceHtml = replaceHtml.replace('%valor%', formatNumero( obj.valor, tipo));

            //Inserir dados no html
            document.querySelector(element).insertAdjacentHTML('beforeend',replaceHtml);
        },

        deletaItemLista: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        //Limpar os campos
        limpaCampos: function () {
            var campos, arrCampos;
            campos = document.querySelectorAll(selectorStr.addDescricao + ',' + selectorStr.addValor);
            
            arrCampos = Array.prototype.slice.call(campos);
            arrCampos.forEach(function(current, index, array) {
                current.value = "";
            });
            arrCampos[0].focus();
        },

        mostrarOrcamento: function(obj) {
            var mostrar = document.querySelector.bind(document), tipo;
            obj.orcamento > 0 ? tipo = 'rec' : tipo = 'desp';
            
            mostrar(selectorStr.orcamentoTotal).textContent = formatNumero(obj.orcamento, tipo);
            mostrar(selectorStr.orcamentoReceita).textContent = formatNumero(obj.totalReceita, 'rec');
            mostrar(selectorStr.orcamentoDespesa).textContent = formatNumero(obj.totalDespesa, 'desp');

            if(obj.porcentagem > 0) {
                mostrar(selectorStr.orcamentoPorcentagem).textContent = obj.porcentagem + '%';
            }else{
                mostrar(selectorStr.orcamentoPorcentagem).textContent = '---'
            }

        },

        mortrarPorcentagem:  function(porcentagens) {

            var campos = document.querySelectorAll(selectorStr.porcentagemDespesa);

            listaForEach(campos, function(current, index) {
                if(porcentagens[index] > 1) {
                    current.textContent = porcentagens[index] + '%';
                }else {
                    current.textContent = '---';
                }
            });
        },

        mostrarMesAtual: function() {
            var dataAtual, mesNomes, anoAtual;
            
            mesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Augosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
            dataAtual = new Date();

            mes = dataAtual.getMonth();
            anoAtual =  dataAtual.getFullYear();
            document.querySelector(selectorStr.addMesAtual).textContent = mesNomes[mes] + ' de ' + anoAtual ;
            console.log(mes);
        },

        trocaOutline: function() {
            var campos, addBottomBorder, trocaBtnCor;
            campos = document.querySelectorAll(
                selectorStr.addTipo + ',' +
                selectorStr.addDescricao  + ',' +
                selectorStr.addValor 
            );
            document.querySelector(selectorStr.addDiv).classList.toggle('add__red-bottom')
            document.querySelector(selectorStr.addIcon).classList.toggle('btn__cor');

            listaForEach(campos, function(current) {
                current.classList.toggle('red-focus');
            });
        },

        dadosSelectortStr: function() {
            return selectorStr;
        }
    };
})();

//Controlador do App
var controladorApp = (function(cntrlOrcamento, cntrlInterface) {

    //Coleção com todos os Event Listeners
    var eventListenersCollection = function() {
        var selectors = cntrlInterface.dadosSelectortStr();
        document.querySelector(selectors.addBtn).addEventListener('click', appAddItem);
        document.addEventListener('keypress', function(e){
            if(e.keyCode === 13 || e.which ===13) {

                appAddItem();
            }
        });
        
        document.querySelector(selectors.container).addEventListener('click', appDeleteItem);
        document.querySelector(selectors.addTipo).addEventListener('change', controladorInterface.trocaOutline);
    };
    
    // Atualiza Orçamento
    var atualizaOrcamento = function() {

        //Chamada calculo orçamento
        controladorOrcamento.calculoOrcamento();

        //Chamada dados do orçamento armazenado
        var orcamento = controladorOrcamento.dadosOrcamento();

        //Mostra dados do orçamento
        controladorInterface.mostrarOrcamento(orcamento);
        console.log(orcamento);

    };

    atualizaPorcentagem = function() {
        //Calcula porcentagem
        controladorOrcamento.calculoPorcentagem();

        //Pega porcentagens do controlador de orçamento
       var porcentagens = controladorOrcamento.dadosPorcentagem();

        //Mostra as porcentagens na tela
        controladorInterface.mortrarPorcentagem(porcentagens);
    }

    var appAddItem = function(){
        var novoItem, input;

        input = controladorInterface.dadosInput();
        novoItem = controladorOrcamento.addItem(input.tipo, input.descricao, input.valor);
        console.log(input);
        console.log('Item Adicionado com sucesso!');
        if(input.descricao  !== "" && !isNaN(input.valor) && input.valor > 0 ) {

        //Adiciona item na lista no HTML
        controladorInterface.addItemLista(novoItem, input.tipo);
        
         //Chamada função Limpa campos
         controladorInterface.limpaCampos();
        
         //Chamada do calculo do orçamento e atualiza
         atualizaOrcamento();

         //Chamada calculo da porcentagem e atualiza
        atualizaPorcentagem();
        }
    };

    var appDeleteItem = function(e) {
        var idItem, splitItem, tipo, ID;

        idItem = e.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(idItem) {
            splitItem = idItem.split('-');

            //Tipo de orçamento(Receita ou despesa)  É o primeiro elemento do Array
            tipo = splitItem[0];
            ID = parseInt(splitItem[1]);

            //Deleta item da estrutura de dados
            controladorOrcamento.deletaItem(tipo, ID);

            //Deleta item da interface
            controladorInterface.deletaItemLista(idItem);

            //Chamada do calculo do orçamento e atualiza
            atualizaOrcamento();
   
            //Chamada calculo da porcentagem e atualiza
            atualizaPorcentagem();
        }
        console.log(e.target.parentNode.parentNode.parentNode.parentNode.id);
    }

    //Função de inicialização do App
    return {
        init: function() {
            controladorInterface.mostrarOrcamento({
                orcamento: 0,
                totalReceita: 0,
                totalDespesa: 0,
                porcentagem: ''
            });
            console.log('Inicializado');
            eventListenersCollection();
            controladorInterface.mostrarMesAtual();
        }
    };
})(controladorOrcamento, controladorInterface);

controladorApp.init();