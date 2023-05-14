import Container from './container'
import { EXAMPLE_PATH } from '../lib/constants'
import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t ">
      <Container>
        <div className="pt-14 flex justify-center  ">
            <a
              href={`https://twitter.com/reiji990/`}
              className="mx-3 font-bold hover:underline"
            >
            <img src="/social-icons/twitter.svg" width="30" />
            </a>
            <a
              href={`https://github.com/reiji990/`}
              className="mx-3 font-bold hover:underline"
            >
            <img src="/social-icons/github.svg" width="30" />
            </a>

          </div>
        <div className="pt-5 pb-14 flex justify-center">
          ©️ 2023 reiji990
        </div>
      </Container>
    </footer>
  )
}

export default Footer