import { useState, FormEvent, MouseEvent } from 'react';
import axios from 'axios';
import useInterval from '@use-it/interval';

type Record = {
  active: boolean
  type: 'A' | 'CNAME' | 'NS'
  name: string
  content: string
}

const allActive = (records: Record[]) => records.every(({ active }) => active);

const RecordList = (props: { records: Record[] }) => {
  const { records } = props;
  return (
    <>
      <div>
        <h1>Update your DNS records</h1>
        <table>
          <thead>
            <tr>
              <td>type</td>
              <td>name</td>
              <td>content</td>
              <td>status</td>
            </tr>
          </thead>
          <tbody>
            {
              records.map(
                record => (
                  <tr key={record.name}>
                    <td>
                      <code>
                        {record.type}
                      </code>
                    </td>
                    <td>{record.name}</td>
                    <td>{record.content}</td>
                    <td>{record.active ? 'added' : 'missing'}</td>
                  </tr>
                ),
              )
            }
          </tbody>
        </table>
      </div>

      <style jsx>{`
        div {
          max-width: 850px;
        }

        h1 {
          color: #fff;
          font-size: 26px;
          font-weight: bold;
          margin-bottom: 30px;
          text-align: center;
        }

        table {
          width: 100%;
        }

        code {
          font-family: 'Menlo', 'Courier New', Courier, monospace;
          color: #fff;
        }

        table td {
          padding: 10px 24px;
          border: 1px solid #444;
        }

        table tbody td {
          padding: 24px;
        }

        table thead td {
          color: #999;
          font-size: 12px;
          text-transform: uppercase;
        }

        table td:nth-child(1) {
          text-align: center;
        }

        table td:nth-child(4) {
          text-align: center;
        }

        table tbody td:nth-child(4) {
          color: #999;
          font-size: 12px;
          text-transform: uppercase;
        }

        table {
          border-collapse: collapse;
          margin-bottom: 20px;
        }
      `}</style>
    </>
  );
};

const LastChecks = (props: { state: string }) => {
  const { state } = props;

  return (
    <>
      <div>
        <h1>{state}</h1>
        <h4>This page should not be closed</h4>
      </div>

      <style jsx>{`
        h1 {
          color: #fff;
          font-size: 26px;
          font-weight: bold;
          margin-bottom: 20px;
          text-align: center;
        }

        h4 {
          color: #fff;
          font-size: 14px;
          font-weight: 400;
          text-align: center;
        }
      `}</style>
    </>
  );
};

const Form = (props: { onSubmit: (domain: string) => any }) => {
  const [domain, setDomain] = useState('');
  const { onSubmit } = props;

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(domain);
  };

  const submitButton = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSubmit(domain);
  };

  return (
    <>
      <div>
        <h1>Enter your Domain</h1>
        <form onSubmit={submitForm}>
          <div>
            <input autoCorrect="off" spellCheck={false} placeholder="domain.tld" value={domain} onChange={e => setDomain(e.target.value)} />
            <button type="button" onClick={e => submitButton(e)}>Continue</button>
          </div>
        </form>
      </div>

      <style jsx>{`
        div {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        h1 {
          color: #fff;
          font-size: 32px;
          margin-top: 0px;
          margin-bottom: 40px;
        }

        input {
          border: 1px solid #444;
          border-radius: 5px;
          background-color: transparent;
          height: 40px;
          width: 240px;
          font-size: 14px;
          text-align: center;
          caret-color: #fff;
          color: #fff;
          outline: none;
          transition-property: border-color;
          transition-duration: 0.3s;
          margin-bottom: 10px;
        }

        button {
          cursor: pointer;
          font-size: 14px;
          background-color: #fff;
          border: 1px solid #fff;
          border-radius: 5px;
          height: 40px;
          width: 240px;
          transition-delay: 0s;
          transition-property: all;
          transition-duration: 0.2s;
          transition-timing-function: ease;
        }

        button:hover {
          background-color: transparent;
          color: #fff;
          border: 1px solid #444;
        }

        input:focus {
          border-color: #aaa;
        }
      `}</style>
    </>
  );
};

const Setup = () => {
  const [records, setRecords] = useState<Record[]>();
  const [domain, setDomain] = useState<string>();
  const [state, setState] = useState<string>();

  const continueSetup = async (recs: Record[]) => {
    if (allActive(recs)) {
      setState('Installing Traefik');
      await axios.request({
        method: 'POST',
        url: '/api/containers',
        params: {
          app: 'traefik',
        },
      });

      setState('Setup complete');
    }
  };

  const submit = async (domainInput: string) => {
    setDomain(domainInput);

    const { data } = await axios.request<Record[]>({
      url: '/api/setup',
      params: {
        domain: domainInput,
        firstCall: true,
      },
    });
    setRecords(data);

    await continueSetup(data);
  };

  useInterval(async () => {
    const { data } = await axios.request<Record[]>({
      url: '/api/setup',
      params: {
        domain,
      },
    });
    setRecords(data);

    await continueSetup(data);
  }, records && !allActive(records) ? 5000 : null);

  if (records && allActive(records)) {
    return <LastChecks state={state} />;
  }

  if (records) {
    return <RecordList records={records} />;
  }

  return <Form onSubmit={submit} />;
};

const page = () => (
  <>
    <div>
      <Setup />
    </div>

    <style jsx>{`
      div {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    `}</style>

    <style jsx global>{`
      html {
          box-sizing: border-box;
        }

        *, *:before, *:after {
          box-sizing: inherit;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: #000;
          color: #ccc;
          margin: 0;
        }

        html, body, #__next {
          height: 100%;
        }
    `}</style>
  </>
);

export default page;
