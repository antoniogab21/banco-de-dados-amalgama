import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Edit2,
  Trash2,
  Plus,
  X,
  Package,
  Save,
} from 'lucide-react';

interface SupplierProductsPageProps {
  userType: 'mercado' | 'fornecedor';
}

interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem: string;
  ativo: boolean;
  fornecedor_nome?: string;
}

export default function SupplierProductsPage({
  userType,
}: SupplierProductsPageProps) {
  const [showModal, setShowModal] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [newProduct, setNewProduct] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    imagem: '📦',
  });

  async function loadProducts() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/produtos', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            'Erro ao carregar produtos'
        );
        return;
      }

      setProducts(data);
    } catch (err) {
      setError(
        'Não foi possível carregar os produtos.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function resetNewProduct() {
    setNewProduct({
      nome: '',
      descricao: '',
      preco: '',
      estoque: '',
      imagem: '📦',
    });
  }

  async function handleAddProduct() {
    if (
      !newProduct.nome ||
      !newProduct.descricao ||
      !newProduct.preco ||
      !newProduct.estoque
    ) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newProduct),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            data.details ||
            'Erro ao criar produto'
        );
        return;
      }

      setProducts((prev) => [
        data.produto,
        ...prev,
      ]);

      resetNewProduct();
      setShowModal(false);
    } catch (err) {
      alert(
        'Não foi possível conectar ao backend.'
      );
    }
  }

  async function handleDeleteProduct(id: number) {
    const confirmDelete = confirm(
      'Deseja remover este produto?'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `/api/produtos/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            'Erro ao remover produto'
        );
        return;
      }

      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );
    } catch (err) {
      alert(
        'Não foi possível conectar ao backend.'
      );
    }
  }

  async function handleSaveEdit() {
    if (!editingProduct) return;

    try {
      const response = await fetch(
        `/api/produtos/${editingProduct.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(editingProduct),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            'Erro ao editar produto'
        );
        return;
      }

      setProducts((prev) =>
        prev.map((product) =>
          product.id === data.produto.id
            ? data.produto
            : product
        )
      );

      setEditingProduct(null);
    } catch (err) {
      alert(
        'Não foi possível conectar ao backend.'
      );
    }
  }

  const totalStock = products.reduce(
    (acc, item) => acc + Number(item.estoque || 0),
    0
  );

  return (
    <>
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
        <div className="p-8">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Meu Catálogo
              </h1>

              <p className="text-gray-600 dark:text-gray-400">
                Gerencie seus produtos disponíveis
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="
                flex items-center gap-2
                bg-gradient-to-r from-yellow-400 to-yellow-500
                dark:from-blue-800 dark:to-blue-950
                hover:from-yellow-500 hover:to-yellow-600
                dark:hover:from-blue-700 dark:hover:to-blue-900
                text-white font-bold px-6 py-3 rounded-xl shadow-lg
                transition
              "
            >
              <Plus className="w-5 h-5" />
              Adicionar Produto
            </motion.button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-sm font-semibold text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* RESUMO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total de Produtos
              </p>

              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {products.length}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Estoque Total
              </p>

              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalStock} un.
              </p>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-600 dark:text-gray-400">
              Carregando produtos...
            </div>
          )}

          {/* PRODUTOS */}
          {!loading && products.length === 0 && (
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />

              <p className="font-bold text-gray-900 dark:text-white">
                Nenhum produto cadastrado
              </p>

              <p className="text-gray-500 dark:text-gray-400">
                Clique em “Adicionar Produto” para começar.
              </p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="
                    bg-white dark:bg-gray-950
                    border border-gray-200 dark:border-gray-800
                    rounded-2xl shadow-sm p-6
                    transition-colors duration-300
                  "
                >
                  <div className="flex justify-between mb-4">
                    <div className="text-5xl">
                      {product.imagem || '📦'}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setEditingProduct(product)
                        }
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition"
                        type="button"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteProduct(product.id)
                        }
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {product.nome}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {product.descricao}
                  </p>

                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Preço</span>

                      <span className="font-bold text-yellow-600 dark:text-blue-300">
                        R$ {Number(product.preco).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Estoque</span>

                      <span className="font-semibold text-gray-900 dark:text-white">
                        {product.estoque} un.
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Status</span>

                      <span className="font-semibold text-green-600 dark:text-green-300">
                        {product.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL NOVO PRODUTO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div
            className="
              bg-white dark:bg-gray-950
              border border-gray-200 dark:border-gray-800
              rounded-3xl p-8 w-full max-w-lg
              text-gray-900 dark:text-white
              shadow-2xl transition-colors duration-300
            "
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Novo Produto
              </h2>

              <button
                onClick={() => setShowModal(false)}
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={newProduct.nome}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    nome: e.target.value,
                  })
                }
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl px-4 py-3 outline-none focus:border-yellow-500 dark:focus:border-blue-700 focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950 transition"
              />

              <textarea
                placeholder="Descrição"
                value={newProduct.descricao}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    descricao: e.target.value,
                  })
                }
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl px-4 py-3 outline-none resize-none focus:border-yellow-500 dark:focus:border-blue-700 focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950 transition"
                rows={3}
              />

              <input
                type="number"
                placeholder="Preço"
                value={newProduct.preco}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    preco: e.target.value,
                  })
                }
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl px-4 py-3 outline-none focus:border-yellow-500 dark:focus:border-blue-700 focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950 transition"
              />

              <input
                type="number"
                placeholder="Estoque"
                value={newProduct.estoque}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    estoque: e.target.value,
                  })
                }
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl px-4 py-3 outline-none focus:border-yellow-500 dark:focus:border-blue-700 focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950 transition"
              />

              <input
                type="text"
                placeholder="Emoji"
                value={newProduct.imagem}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    imagem: e.target.value,
                  })
                }
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl px-4 py-3 outline-none focus:border-yellow-500 dark:focus:border-blue-700 focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950 transition"
              />

              <button
                onClick={handleAddProduct}
                type="button"
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-blue-800 dark:to-blue-950 hover:from-yellow-500 hover:to-yellow-600 dark:hover:from-blue-700 dark:hover:to-blue-900 text-white font-bold py-3 rounded-xl transition shadow-lg"
              >
                Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 w-full max-w-lg text-gray-900 dark:text-white shadow-2xl transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Editar Produto
              </h2>

              <button
                onClick={() => setEditingProduct(null)}
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={editingProduct.nome}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    nome: e.target.value,
                  })
                }
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-500 dark:focus:border-blue-700 focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950 transition"
              />

              <textarea
                value={editingProduct.descricao || ''}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    descricao: e.target.value,
                  })
                }
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none resize-none focus:border-yellow-500 dark:focus:border-blue-700 focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950 transition"
                rows={3}
              />

              <input
                type="number"
                value={editingProduct.preco}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    preco: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-500 dark:focus:border-blue-700 focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950 transition"
              />

              <input
                type="number"
                value={editingProduct.estoque}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    estoque: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-500 dark:focus:border-blue-700 focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950 transition"
              />

              <input
                type="text"
                value={editingProduct.imagem || ''}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    imagem: e.target.value,
                  })
                }
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:border-yellow-500 dark:focus:border-blue-700 focus:ring-4 focus:ring-yellow-100 dark:focus:ring-blue-950 transition"
              />

              <button
                onClick={handleSaveEdit}
                type="button"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}