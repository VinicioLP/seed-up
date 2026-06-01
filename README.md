# Executando a API Localmente

A forma mais simples de executar o projeto sem realizar deploy da API é utilizando o roteamento de internet do celular (hotspot).

## 1. Conecte o computador ao hotspot do celular

Ative o compartilhamento de internet do celular e conecte o computador à rede criada.

## 2. Descubra o IP do computador

Abra o Prompt de Comando (CMD) e execute:

```bash
ipconfig
```

Procure pelo adaptador de rede conectado ao hotspot e localize o campo:

```text
Endereço IPv4. . . . . . . . . . . . : 192.168.X.X
```

Anote esse IP, pois ele será utilizado para acessar a API.

## 3. Inicie a API

Acesse a pasta do projeto:

```bash
cd api-seed-up
```

Execute o servidor do Laravel:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Você deverá ver uma saída semelhante a:

```text
INFO  Server running on [http://0.0.0.0:8000]
```

## 4. Configure a URL da API

Utilize o IP obtido no passo 2 como endereço base da API:

```text
http://192.168.X.X:8000
```

Exemplo:

```text
http://192.168.15.100:8000
```

## Observações

- O computador e o celular devem estar conectados à mesma rede (hotspot).
- Certifique-se de que o firewall do Windows não esteja bloqueando a porta `8000`.
- Caso a API não seja acessível, tente liberar a porta ou permitir o acesso ao processo do PHP quando o Windows solicitar.
