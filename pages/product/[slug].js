import React, {useContext} from 'react';
import {useRouter} from "next/router";
import data from "../../utils/data";
import Layout from "../../components/Layout";
import {
    Grid,
    Link,
    List,
    ListItem,
    Typography,
    Card,
    Button,
    TextField,
    CircularProgress,
} from '@material-ui/core'
import NextLink from 'next/link'
import useStyles from "../../utils/styles";
import Image from 'next/image'
import {connect, convertDocToObj} from "../../db/config/mongoDB-config";
import Product from "../../db/models/Product"
import axios from 'axios'
import {Store} from "../../utils/Store";




const ProductScreen = ({ product }) => {
    const classes = useStyles()
    const {state, dispatch} = useContext(Store)
    const router = useRouter()

    const addToCartHandler = async () => {
        const { data } = await axios.get(`/api/products/${product._id}`)
        const existItem = state.cart.cartItems?.find(item => item._id===product._id)
        const quantity = existItem ? existItem.quantity+1 : 1

        if(quantity > data.countInStock){
            return window.alert("Sorry, this product is out of stock!😣")
        }

        dispatch({type: 'CART_ADD_ITEM', payload: {...product, quantity}})

        router.push('/cart')
    }

    if(!product){
        return (
            <div>
                <h2>Oops! We do not have this product. 😣</h2>
            </div>
        )
    }

    return (
        <Layout title={product.name} description={product.description}>
            <div className={classes.section}>
                <NextLink href='/' passHref>
                    <Link>
                        <Typography>
                            Back to products
                        </Typography>
                    </Link>
                </NextLink>
            </div>
            <Grid container spacing={1}>
                <Grid item md={6} xs={12}>
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={640}
                        height={640}
                        layout='responsive'
                    />
                </Grid>
                <Grid item md={3} xs={12}>
                    <List>
                        <ListItem>
                            <Typography component='h1' variant='h1'>{product.name}</Typography>
                        </ListItem>
                        <ListItem>
                            <Typography>Category: {product.category}</Typography>
                        </ListItem>
                        <ListItem>
                            <Typography>Brand: {product.brand}</Typography>
                        </ListItem>
                        <ListItem>
                            <Typography>Rating: {product.rating} stars ({product.numReviews} reviews)</Typography>
                        </ListItem>
                        <ListItem>
                            <Typography>Description: {product.description}</Typography>
                        </ListItem>
                    </List>
                </Grid>
                <Grid item md={3} xs={12}>
                    <Card>
                        <List>
                            <ListItem>
                                <Grid container>
                                    <Grid item xs={6}><Typography>Price</Typography></Grid>
                                    <Grid item xs={6}><Typography>${product.price}</Typography></Grid>
                                </Grid>
                            </ListItem>
                            <ListItem>
                                <Grid container>
                                    <Grid item xs={6}><Typography>Status</Typography></Grid>
                                    <Grid item xs={6}><Typography>{product.countInStock>0?'In stock':'Sold out'}</Typography></Grid>
                                </Grid>
                            </ListItem>
                            <ListItem>
                                <Button fullWidth variant='contained' color='primary'
                                    onClick={()=>addToCartHandler()}
                                >Add to cart</Button>
                            </ListItem>
                        </List>
                    </Card>
                </Grid>
            </Grid>
        </Layout>
    );
};


export const getServerSideProps = async (context) => {
    const {params}=context
    const {slug} = params
    console.log(slug)
    await connect()
    const product = await Product.findOne({slug}).lean()
    // await disconnect()

    return {
        props: {
            product: convertDocToObj(product)
        }
    }
}

export default ProductScreen;