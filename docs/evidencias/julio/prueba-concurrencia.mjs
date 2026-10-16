
const API = 'http://localhost:3000/api';
const LAURA = { email: 'laura@correo.com', password: 'Clave123*' };
const PEDRO = { email: 'pedro@correo.com', password: 'Clave123*' };

async function login(user) {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const data = await r.json();
  if (!data.access_token) {
    throw new Error('Login falló: ' + JSON.stringify(data));
  }
  return data.access_token;
}

async function llamar(metodo, ruta, token, body) {
  const r = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, data: await r.json() };
}

async function main() {
  const tLaura = await login(LAURA);
  const tPedro = await login(PEDRO);

  const saldo = async (token) =>
    (await llamar('GET', '/cuentas/mi-cuenta/saldo', token)).data;

  const laura0 = await saldo(tLaura);
  const pedro0 = await saldo(tPedro);

  if (
    typeof laura0.saldo !== 'number' ||
    typeof pedro0.saldo !== 'number'
  ) {
    throw new Error('La ruta de saldo de Desiree aún no está disponible');
  }

  console.log('ANTES -> Laura:', laura0.saldo, '| Pedro:', pedro0.saldo);

  const operaciones = [];

  for (let i = 0; i < 20; i++) {
    operaciones.push(
      llamar('POST', '/transacciones/transferencia', tLaura, {
        cuentaDestinoId: pedro0.cuentaId,
        monto: 100,
      }),
    );

    operaciones.push(
      llamar('POST', '/transacciones/transferencia', tPedro, {
        cuentaDestinoId: laura0.cuentaId,
        monto: 100,
      }),
    );
  }

  const resultados = await Promise.all(operaciones);

  const ok = resultados.filter((r) => r.status === 201).length;
  const enviadasLaura = resultados.filter(
    (r, i) => i % 2 === 0 && r.status === 201,
  ).length;
  const enviadasPedro = resultados.filter(
    (r, i) => i % 2 === 1 && r.status === 201,
  ).length;

  const laura1 = await saldo(tLaura);
  const pedro1 = await saldo(tPedro);

  const esperadoLaura =
    laura0.saldo - enviadasLaura * 100 + enviadasPedro * 100;

  const esperadoPedro =
    pedro0.saldo - enviadasPedro * 100 + enviadasLaura * 100;

  const bien =
    Math.abs(laura1.saldo - esperadoLaura) < 0.001 &&
    Math.abs(pedro1.saldo - esperadoPedro) < 0.001;

  console.log('DESPUÉS -> Laura:', laura1.saldo, '| Pedro:', pedro1.saldo);
  console.log(`Operaciones exitosas: ${ok} de ${resultados.length}`);
  console.log('Esperado -> Laura:', esperadoLaura, '| Pedro:', esperadoPedro);

  console.log(
    bien
      ? '✅ CORRECTO: no se perdió ni apareció dinero'
      : '❌ ERROR: los saldos no cuadran',
  );
}

main().catch(console.error);
