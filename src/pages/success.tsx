import Link from "next/link";
import { ImageContainer, SuccessContainer } from "../styles/pages/succes";
import { GetServerSideProps } from "next";
import { stripe } from "../lib/stripe";
import Stripe from "stripe";
import Image from "next/image";
import Head  from "next/head";

interface SuceessProps {
   customerName: string;
    product: {
         name: string;
         imageUrl: string;
    }
}

export default function Sucess({customerName,product}: SuceessProps) {
    return (
        <>
            <Head>
                <title> Compra efetuada | Ignite Shop</title>

                <meta name="robots" content="noindex" />
            </Head>
            <SuccessContainer>
                <h1>Compra efetuada !</h1>
                <ImageContainer>
                    <Image src={product.imageUrl} width={120} height={110} alt={product.name} />
                </ImageContainer>
                <p>
                    Uhuul <strong>{customerName}</strong>, sua <strong>{product.name}</strong> já está a caminho da sua casa.
                </p>
                <Link href="/">
                    Voltar ao catálogo
                </Link>
            </SuccessContainer>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({query}) => {
    const sessionId = query.session_id as string;

    if (!sessionId) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    // Aqui estamos buscando o nome do cliente e o nome do produto que eu busquei na API do Stripe por meio do expand, eu tenho que fazer isso aqui porque o Stripe não me retorna essas informações na hora que eu crio a sessão de checkout
    const response = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'line_items.data.price.product']
    });

    // Aqui estamos pegando o nome do cliente e o nome do produto que eu busquei na API do Stripe por meio do expand  
    const customerName = response.customer_details ? response.customer_details.name as string : '';

    // Aqui estamos pegando o produto que eu busquei na API do Stripe por meio do expand
    const product = response.line_items?.data[0]?.price?.product as Stripe.Product;

    return {
        props:  {
            customerName,
            product: product ? {
                name: product.name,
                imageUrl: product.images[0],
             } : null
        }
    }
}