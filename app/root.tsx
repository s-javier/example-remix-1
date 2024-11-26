import { useEffect, useState } from 'react'
import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from '@remix-run/react'
import { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'

import { createEmptyContact, getContacts } from './data'

import appStylesHref from './app.css?url'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: appStylesHref }]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')
  const contacts = await getContacts(q)
  return { contacts, q }
}

export const action = async () => {
  const contact = await createEmptyContact()
  return redirect(`/contacts/${contact.id}/edit`)
}

export default function App() {
  const navigation = useNavigation()
  const { contacts, q } = useLoaderData<typeof loader>()
  const [query, setQuery] = useState(q || '')
  const submit = useSubmit()

  useEffect(() => {
    setQuery(q || '')
  }, [q])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form id="search-form" role="search" onChange={(event) => submit(event.currentTarget)}>
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
                onChange={(event) => setQuery(event.currentTarget.value)}
                value={query}
              />
              <div id="search-spinner" aria-hidden hidden={true} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? 'active' : isPending ? 'pending' : ''
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{' '}
                      {contact.favorite ? <span>★</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>

        <div id="detail" className={navigation.state === 'loading' ? 'loading' : ''}>
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
