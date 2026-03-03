let eventBus = new Vue()

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>
    `
})

Vue.component('product-review', {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
                <b>Please correct the following error(s):</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>
            <p>
                <label for="name">Name:</label>
                <input id="name" v-model="name" placeholder="name">
            </p>
            <p>
                <label for="review">Review:</label>
                <textarea id="review" v-model="review"></textarea>
            </p>
            <p>
                <label for="rating">Rating:</label>
                <select id="rating" v-model.number="rating">
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>
            <p>
                <label>Would you recommend this product?</label><br>
                <div class="radio-form">
                    <input type="radio" id="yes" value="yes" v-model="recommend" :disabled="rating !== null && rating < 4">
                    <label for="yes" :class="{ disabled: rating !== null && rating < 4 }">Yes</label>
                    <input type="radio" id="no" value="no" v-model="recommend" :disabled="rating !== null && rating >= 4">
                    <label for="no" :class="{ disabled: rating !== null && rating >= 4 }">No</label>
                </div>
            </p>
            <p>
                <input type="submit" value="Submit">
            </p>
        </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors = []
            if (!this.name) this.errors.push("Name required.")
            if (!this.review) this.errors.push("Review required.")
            if (!this.rating) this.errors.push("Rating required.")
            if (!this.recommend) this.errors.push("Recommendation required.")
            if (this.rating < 4 && this.rating !== null && this.recommend === "yes") {
                this.errors.push("Cannot recommend product with rating below 4. Please select 'No'.")
            }
            if (this.rating >= 4 && this.rating !== null && this.recommend === "no") {
                this.errors.push("Must recommend product with rating 4 or above. Please select 'Yes'.")
            }
            if (this.errors.length === 0) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            }
        }
    }
})

Vue.component('cart-modal', {
    props: {
        show: {
            type: Boolean,
            required: true
        },
        cartItems: {
            type: Array,
            required: true
        },
        cartLength: {
            type: Number,
            required: true
        },
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
            <div class="modal">
                <button class="modal-close" @click="$emit('close')">&times;</button>
                <h2>Shopping Cart</h2>
                <div v-if="cartItems.length > 0">
                    <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
                        <img :src="item.image" :alt="item.color" class="cart-item-image">
                        <div class="cart-item-info">
                            <h3>Vue Mastery Socks - {{ item.color }}</h3>
                            <p>Color: {{ item.color }}</p>
                            <p>Price:</p>
                        </div>
                    </div>
                    <div class="shipping-info">
                        <b>Shipping:</b>
                        <p>
                            {{ premium ? 'Free Shipping (Premium Member)' : 'Shipping Cost: $2.99' }}
                        </p>
                        <b>Total items: {{ cartLength }}</b> </br>
                        <b>Total cost:</b>
                    </div>
                </div>
                <div v-else class="empty-cart">
                    <p>Your cart is empty</p>
                    <p>Add some products to get started!</p>
                </div>
            </div>
        </div>
    `
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        },
        premium: {
            type: Boolean,
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },
    template: `
        <div>
            <ul>
                <span class="tab" 
                    :class="{ activeTab: selectedTab === tab }"
                    v-for="(tab, index) in tabs" 
                    @click="selectedTab = tab"
                >{{ tab }}</span>
            </ul>
            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul>
                    <li v-for="review in reviews">
                        <p>{{ review.name }}</p>
                        <p>Rating: {{ review.rating }}</p>
                        <p>{{ review.review }}</p>
                        <p>Recommend: {{ review.recommend }}</p>
                    </li>
                </ul>
            </div>
            <div v-show="selectedTab === 'Make a Review'">
                <product-review></product-review>
            </div>
            <div v-show="selectedTab === 'Shipping'">
                <p>Shipping cost: {{ shippingCost }}</p>
            </div>
            <div v-show="selectedTab === 'Details'">
                <product-details :details="details"></product-details>
            </div>
        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews'
        }
    },
    computed: {
        shippingCost() {
            if (this.premium) {
                return "Free"
            } else {
                return "$2.99"
            }
        }
    }
})

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <div class="product">
            <div class="product-image">
                <img :src="image" :alt="altText"/>
            </div>
            <div class="product-info">
                <h1>{{ title }}</h1>
                <p>{{ description }}</p>
                <p v-if="inStock">In Stock</p>
                <p v-else :class="{ 'line-through': !inStock }">Out of Stock</p>
                <p>{{ sale }}</p>
                <div 
                    class="color-box" 
                    v-for="(variant, index) in variants" 
                    :key="variant.variantId" 
                    :style="{ backgroundColor: variant.variantColor }"
                    @mouseover="updateProduct(index)"
                ></div>
                <ul>
                    <li v-for="size in sizes">{{ size }}</li>
                </ul>
                <button 
                    @click="addToCart" 
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
                >Add to cart</button>
                <button 
                    @click="removeFromCart" 
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
                >Remove from cart</button>
                <a :href="link">More products like this</a>
            </div>
            <product-tabs 
                :reviews="reviews" 
                :premium="premium"
                :details="details"
            ></product-tabs>
        </div>
    `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            description: "A pair of warm, fuzzy socks",
            selectedVariant: 0,
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            onSale: true,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct(index) {
            this.selectedVariant = index
        },
        removeFromCart() {
            this.$emit('remove-from-cart')
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + ' are on sale!'
            } else {
                return this.brand + ' ' + this.product + ' are not on sale'
            }
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }
})

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
        cartItems: [],
        showCartModal: false
    },
    methods: {
        updateCart(id) {
            this.cart.push(id)
            this.updateCartItems()
        },
        removeFromCart() {
            this.cart.pop()
            this.updateCartItems()
        },
        openCartModal() {
            this.updateCartItems()
            this.showCartModal = true
        },
        closeCartModal() {
            this.showCartModal = false
        },
        updateCartItems() {
            this.cartItems = this.cart.map(id => 
            id === 2234 
            ? { color: 'green', image: "./assets/vmSocks-green-onWhite.jpg" }
            : { color: 'blue', image: "./assets/vmSocks-blue-onWhite.jpg" }
    )
}
    }
})