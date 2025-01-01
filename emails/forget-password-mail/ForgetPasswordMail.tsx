import { Body, Button, Container, Font, Head, Heading, Html, Tailwind } from '@react-email/components';
import * as React from 'react';

type TProps = { resetPasswordUrl: string, userNickname: string, accountName: string }

export default function ForgetPasswordMail({ resetPasswordUrl, userNickname, accountName }: TProps) {
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
            <Heading as="h1" className="text-center m-0 mb-[5px]">
                Привет, {userNickname}!
            </Heading>
            <Heading as="h2" className="text-center m-0 mb-2">
                Мы получили запрос на сброс пароля аккаунта: {accountName}.
            </Heading>
            <Heading as="p" className="text-center mt-0 mb-2">
                Нажмите на ссылку ниже, чтобы сменить пароль вашего аккаунта. <br />
                Если вы не делали запрос на сброс пароля, просто проигнорируйте это сообщение.
            </Heading>
              <Button
                href={resetPasswordUrl}
                className="bg-[#00b3e5] py-[15px] px-[30px] rounded-[5px] text-white cursor-pointer block max-w-max m-auto"
              >
                Сменить пароль
              </Button>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
