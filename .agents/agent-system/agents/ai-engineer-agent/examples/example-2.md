# Example 2: RAG (Retrieval-Augmented Generation) Pipeline

## Mission
Build a RAG system that answers questions from a document corpus using vector embeddings, semantic search, and LLM generation.

## Requirements
- Python + LangChain
- OpenAI embeddings + GPT-4
- ChromaDB for vector storage
- PDF document loader
- Chunking strategy with overlap

## Implementation

```python
# rag/document_loader.py
from langchain.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

def load_and_chunk_documents(docs_path: str, chunk_size: int = 1000, overlap: int = 200):
    """Load PDFs and split into semantic chunks."""
    
    loader = PyPDFDirectoryLoader(docs_path)
    raw_docs = loader.load()
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
        length_function=len
    )
    
    chunks = splitter.split_documents(raw_docs)
    
    # Add metadata
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_id"] = i
        chunk.metadata["char_count"] = len(chunk.page_content)
    
    print(f"Loaded {len(raw_docs)} documents → {len(chunks)} chunks")
    return chunks
```

```python
# rag/vector_store.py
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
import os

def create_vector_store(chunks, persist_dir: str = "./chroma_db"):
    """Create and persist vector store from document chunks."""
    
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=persist_dir,
        collection_metadata={"hnsw:space": "cosine"}
    )
    
    vector_store.persist()
    print(f"Vector store created with {len(chunks)} embeddings")
    return vector_store

def load_vector_store(persist_dir: str = "./chroma_db"):
    """Load existing vector store."""
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    return Chroma(persist_directory=persist_dir, embedding_function=embeddings)
```

```python
# rag/chain.py
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

PROMPT_TEMPLATE = """You are a helpful assistant answering questions based on the provided context.
If the answer is not in the context, say "I don't have enough information to answer that."

Context:
{context}

Question: {question}

Answer:"""

def create_rag_chain(vector_store, model: str = "gpt-4", top_k: int = 5):
    """Create RAG chain with retrieval and generation."""
    
    llm = ChatOpenAI(model=model, temperature=0.1)
    retriever = vector_store.as_retriever(
        search_type="mmr",  # Maximal Marginal Relevance for diversity
        search_kwargs={"k": top_k, "fetch_k": 20}
    )
    
    prompt = PromptTemplate(
        template=PROMPT_TEMPLATE,
        input_variables=["context", "question"]
    )
    
    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": prompt},
        return_source_documents=True
    )
    
    return chain

def ask(chain, question: str) -> dict:
    """Query the RAG chain and return answer with sources."""
    result = chain({"query": question})
    
    sources = [
        {
            "source": doc.metadata.get("source", "unknown"),
            "page": doc.metadata.get("page", 0),
            "chunk_id": doc.metadata.get("chunk_id", 0),
            "preview": doc.page_content[:200] + "..."
        }
        for doc in result["source_documents"]
    ]
    
    return {
        "answer": result["result"],
        "sources": sources,
        "total_sources": len(sources)
    }
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "ai-engineer-agent",
  "timestamp": "2026-04-08T14:00:00Z",
  "status": "success",
  "confidence": 0.89,
  "input_received": {
    "from_agent": null,
    "task_summary": "Build RAG pipeline for document Q&A with vector search",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "design",
    "data": {
      "problem_type": "retrieval_augmented_generation",
      "components": ["document_loader", "text_splitter", "embedding_model", "vector_store", "retrieval_chain", "llm"],
      "embedding_model": "text-embedding-3-small",
      "llm": "GPT-4",
      "vector_db": "ChromaDB",
      "retrieval_strategy": "MMR (Maximal Marginal Relevance)",
      "chunk_config": {"size": 1000, "overlap": 200, "splitter": "RecursiveCharacterTextSplitter"},
      "pipeline_steps": ["load_pdfs", "chunk_documents", "generate_embeddings", "store_vectors", "create_retrieval_chain"],
      "features": ["source attribution", "diverse retrieval (MMR)", "configurable top_k"]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["rag/document_loader.py", "rag/vector_store.py", "rag/chain.py"]
  },
  "context_info": {
    "input_tokens": 500,
    "output_tokens": 3200,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 4800,
    "tokens_used": 3700,
    "retry_count": 0,
    "risk_level": "medium",
    "approval_status": "not_required",
    "checkpoint_id": null
  }
}
```

## Best Practices Applied
- Recursive text splitter with semantic separators (paragraphs → sentences → words)
- Chunk overlap (200 chars) to preserve context across boundaries
- MMR retrieval for diverse, non-redundant results
- Source attribution for every answer (traceability)
- Temperature 0.1 for factual, consistent answers
- Persistence layer for vector store (avoid re-embedding)
- Graceful handling of unanswerable questions in prompt
