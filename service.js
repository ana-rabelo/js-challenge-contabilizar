const validarEntradaDeDados = (lancamento) => {
   const validacoes = [
      { condicao: !contemSomenteDigitos(lancamento.cpf), mensagem: 'CPF deve conter apenas números' },
      { condicao: !CpfEhValido(lancamento.cpf), mensagem: 'CPF inválido' },
      { condicao: typeof lancamento.valor !== 'number', mensagem: 'Valor deve ser um número' },
      { condicao: lancamento.valor < -2000, mensagem: 'Valor não pode ser inferior a -2000' },
      { condicao: lancamento.valor > 15000, mensagem: 'Valor não pode ser superior a 15000' }
  ];
  
  const erros = validacoes
                  .filter(v => v.condicao)
                  .map(v => v.mensagem);
  return erros.length ? erros : null;
}

const recuperarSaldosPorConta = (lancamentos) => {
   const saldosPorConta = lancamentos.reduce((acc, lancamento) => {
      if (!acc[lancamento.cpf]) acc[lancamento.cpf] = 0;
      acc[lancamento.cpf] += lancamento.valor;
      return acc ;
   }, {});

   return Object.entries(saldosPorConta)
                  .map(([cpf, valor]) => ({ cpf, valor }))
}

const recuperarMaiorMenorLancamentos = (cpf, lancamentos) => {
   const valoresPorCPF = filtraPorCpf(lancamentos, cpf)
                        .map(_ => _.valor);
   return [
         { cpf, valor: Math.min(...valoresPorCPF) }, 
         { cpf, valor: Math.max(...valoresPorCPF) }
   ];
}

const recuperarMaioresSaldos = (lancamentos) => {
   return ordenaPorValorEDivide(recuperarSaldosPorConta(lancamentos));
}

const recuperarMaioresMedias = (lancamentos) => {
   const saldosPorConta = recuperarSaldosPorConta(lancamentos);
   const medias = saldosPorConta.map(
      ({ cpf, valor }) => (
         {  cpf, 
            valor: valor / filtraPorCpf(lancamentos, cpf).length 
         }));
   return ordenaPorValorEDivide(medias);
}

/* Funções de validação e auxiliares */

const contemSomenteDigitos = (str) => {
   return /^\d+$/.test(str);
}

const CpfEhValido = (cpf) => {
   if (cpf && cpf.length < 11) return false;
   const cpfLimpo = cpf.replace(/\.|-/g, '');
   if (!validaNumerosRepetidos(cpfLimpo) && validaDigitoVerificador(cpfLimpo)) return true;
};

function validaNumerosRepetidos(cpf) {
   const numerosRepetidos = [
       '00000000000',
       '11111111111',
       '22222222222',
       '33333333333',
       '44444444444',
       '55555555555',
       '66666666666',
       '77777777777',
       '88888888888',
       '99999999999'
   ]

   return numerosRepetidos.includes(cpf);
}

function validaDigitoVerificador(cpf) {
   const calcularDigito = (cpfNumeros, fatorInicial) => {
       let soma = cpfNumeros.reduce((acc, num, index) => acc + Number(num) * (fatorInicial - index), 0);
       return (soma % 11 <= 2) ? 0 : 11 - (soma % 11);
   };

   const cpfNumeros = cpf.slice(0, -2).split('');
   const primeiroDigito = calcularDigito(cpfNumeros, 10);
   cpfNumeros.push(primeiroDigito.toString());

   const segundoDigito = calcularDigito(cpfNumeros, 11);
   cpfNumeros.push(segundoDigito.toString());

   return cpfNumeros.join('') === cpf;
}

function ordenaPorValorEDivide(lancamentos) {
   return lancamentos.sort((a, b) => b.valor - a.valor).slice(0, 3);
}

function filtraPorCpf(lancamentos, cpf) {
   return lancamentos.filter(lancamento => lancamento.cpf === cpf);
}