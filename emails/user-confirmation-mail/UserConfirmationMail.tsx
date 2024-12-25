import { Body, Button, Container, Font, Head, Heading, Html, Tailwind } from '@react-email/components';
import * as React from 'react';

type TProps = { confirmUrl: string, email: string, siteName: string }

export default function UserConfirmationEmail({ confirmUrl, email, siteName }: TProps) {
  // TODO: на телефоне не подтягиваются шрифты
  return (
    <Html lang="ru">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin></link>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap" rel="stylesheet"></link>
      <Font
          fontFamily="Roboto"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Tailwind>
        <Body className="bg-[#f9f9f9] p-[10px]">
          <Container className="bg-white p-[20px] rounded-md">
            <Heading as="h1" className="text-center">Привет, {email}! <br/>
              Ты зарегистрировался на {siteName}!
            </Heading>
            <Heading as="p" className="text-center">
                Чтобы подтвердить свой адрес электронной почты и завершить регистрацию, нажмите на кнопку "Подтвердить регистрацию".
            </Heading>
              <Button
                href={confirmUrl}
                className="bg-[#4d76ef] p-[15px] rounded-xl text-white cursor-pointer block max-w-max m-auto"
              >
                Подтвердить регистрацию
              </Button>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
