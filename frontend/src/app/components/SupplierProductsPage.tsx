import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Edit2,
  Trash2,
  Plus,
  X,
  Package,
  Save
} from 'lucide-react';

interface SupplierProductsPageProps {
  userType: 'mercado' | 'fornecedor';
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  sold: number;
  image: string;
}

export default function SupplierProductsPage({
  userType,
}: SupplierProductsPageProps) {

  const [showModal, setShowModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: 'Arroz Tipo 1 - 5kg',
      description: 'Arroz branco tipo 1, pacote de 5kg',
      price: 22.9,
      stock: 500,
      sold: 450,
      image: '🌾',
    },
    {
      id: 2,
      name: 'Feijão Preto - 1kg',
      description: 'Feijão preto premium',
      price: 6.9,
      stock: 300,
      sold: 380,
      image: '🫘',
    },
    {
      id: 3,
      name: 'Óleo de Soja - 900ml',
      description: 'Óleo de soja refinado',
      price: 5.9,
      stock: 200,
      sold: 290,
      image: '🧴',
    },
  ]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '📦',
  });

  function handleAddProduct() {

    if (
      !newProduct.name ||
      !newProduct.description ||
      !newProduct.price ||
      !newProduct.stock
    ) {
      alert('Preencha todos os campos');
      return;
    }

    const product: Product = {
      id: Date.now(),
      name: newProduct.name,
      description: newProduct.description,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      sold: 0,
      image: newProduct.image,
    };

    setProducts([...products, product]);

    setNewProduct({
      name: '',
      description: '',
      price: '',
      stock: '',
      image: '📦',
    });

    setShowModal(false);
  }

  function handleDeleteProduct(id: number) {

    const confirmDelete = confirm(
      'Deseja remover este produto?'
    );

    if (confirmDelete) {
      setProducts(
        products.filter((product) => product.id !== id)
      );
    }
  }

  function handleSaveEdit() {

    if (!editingProduct) return;

    setProducts(
      products.map((product) =>
        product.id === editingProduct.id
          ? editingProduct
          : product
      )
    );

    setEditingProduct(null);
  }

  return (
    <>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">

          <div className="flex items-center justify-between mb-8">

            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Meu Catálogo
              </h1>

              <p className="text-gray-600">
                Gerencie seus produtos disponíveis
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Adicionar Produto
            </motion.button>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Total de Produtos
              </p>

              <p className="text-3xl font-bold text-gray-900">
                {products.length}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Estoque Total
              </p>

              <p className="text-3xl font-bold text-gray-900">
                {products.reduce(
                  (acc, item) => acc + item.stock,
                  0
                )} un.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map((product) => (

              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm p-6"
              >

                <div className="flex justify-between mb-4">

                  <div className="text-5xl">
                    {product.image}
                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        setEditingProduct(product)
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteProduct(product.id)
                      }
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>

                  </div>
                </div>

                <h3 className="font-bold text-lg">
                  {product.name}
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  {product.description}
                </p>

                <div className="space-y-2">

                  <div className="flex justify-between">
                    <span>Preço</span>

                    <span className="font-bold text-yellow-600">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estoque</span>

                    <span>{product.stock} un.</span>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* MODAL NOVO PRODUTO */}
      {showModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-3xl p-8 w-full max-w-lg">

            <div className="flex justify-between mb-6">

              <h2 className="text-2xl font-bold">
                Novo Produto
              </h2>

              <button
                onClick={() => setShowModal(false)}
              >
                <X />
              </button>

            </div>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Nome"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    name: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <textarea
                placeholder="Descrição"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    description: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <input
                type="number"
                placeholder="Preço"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <input
                type="number"
                placeholder="Estoque"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stock: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <input
                type="text"
                placeholder="Emoji"
                value={newProduct.image}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    image: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <button
                onClick={handleAddProduct}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl"
              >
                Salvar Produto
              </button>

            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {editingProduct && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-3xl p-8 w-full max-w-lg">

            <div className="flex justify-between mb-6">

              <h2 className="text-2xl font-bold">
                Editar Produto
              </h2>

              <button
                onClick={() => setEditingProduct(null)}
              >
                <X />
              </button>

            </div>

            <div className="space-y-4">

              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    name: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <textarea
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <button
                onClick={handleSaveEdit}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
              >
                Salvar Alterações
              </button>

            </div>
          </div>
        </div>
      )}

    </>
  );
}